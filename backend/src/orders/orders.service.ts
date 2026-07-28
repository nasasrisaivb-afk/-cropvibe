import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditAction,
  OrderKind,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  WalletTxnType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calcFees, orderNumber, pageMeta, paginate } from '../common/utils';

const SELLER_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
  ACCEPTED: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  PACKED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.COMPLETED],
  CONFIRMED: [OrderStatus.RENTED, OrderStatus.CANCELLED],
  RENTED: [OrderStatus.RETURN_INITIATED],
  RETURN_INITIATED: [OrderStatus.COMPLETED],
  IN_PROGRESS: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, as: 'buyer' | 'seller' = 'seller', page = 1, limit = 20) {
    const { take, skip, page: p, limit: l } = paginate(page, limit);
    const where =
      as === 'buyer'
        ? { buyerId: userId, deletedAt: null }
        : { sellerId: userId, deletedAt: null };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: true,
          buyer: { select: { id: true, name: true, phone: true } },
          seller: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: items, meta: pageMeta(total, p, l) };
  }

  async get(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: {
        items: { include: { listing: true } },
        payment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        buyer: { select: { id: true, name: true, phone: true, location: true } },
        seller: { select: { id: true, name: true, phone: true, location: true } },
      },
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your order' });
    }
    return order;
  }

  async checkout(
    buyerId: string,
    input: {
      listingId: string;
      quantity: number;
      kind?: OrderKind;
      startAt?: string;
      endAt?: string;
      paymentMethod?: PaymentMethod;
      notes?: string;
    },
  ) {
    const listing = await this.prisma.listing.findFirst({
      where: { id: input.listingId, deletedAt: null, status: 'PUBLISHED' },
    });
    if (!listing) throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'Listing unavailable' });
    if (listing.ownerId === buyerId) {
      throw new BadRequestException({ code: 'SELF_ORDER', message: 'Cannot order your own listing' });
    }
    if (listing.moq && input.quantity < Number(listing.moq)) {
      throw new BadRequestException({
        code: 'MOQ_NOT_MET',
        message: `Minimum order quantity is ${listing.moq}`,
      });
    }

    const kind =
      input.kind ??
      (listing.type === 'EQUIPMENT'
        ? OrderKind.RENTAL
        : listing.type === 'SERVICE'
          ? OrderKind.SERVICE
          : listing.type === 'COURSE'
            ? OrderKind.COURSE
            : OrderKind.PRODUCT);

    const unit = Number(listing.price);
    const subtotal = Math.round(unit * input.quantity * 100) / 100;
    const { platformFee, total } = calcFees(subtotal);
    const deposit = listing.deposit ? Number(listing.deposit) : null;

    const initialStatus =
      kind === OrderKind.RENTAL || kind === OrderKind.SERVICE
        ? OrderStatus.PENDING
        : OrderStatus.PENDING;

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: orderNumber(kind),
          kind,
          status: initialStatus,
          buyerId,
          sellerId: listing.ownerId,
          subtotal,
          platformFee,
          total: total + (deposit ?? 0),
          deposit,
          startAt: input.startAt ? new Date(input.startAt) : null,
          endAt: input.endAt ? new Date(input.endAt) : null,
          notes: input.notes,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // unpaid auto-expire 30m
          items: {
            create: [
              {
                listingId: listing.id,
                title: listing.title,
                quantity: input.quantity,
                unitPrice: unit,
                lineTotal: subtotal,
              },
            ],
          },
          statusHistory: {
            create: [{ toStatus: initialStatus, actorId: buyerId, note: 'Order placed' }],
          },
          payment: {
            create: {
              method: input.paymentMethod ?? PaymentMethod.UPI,
              status: PaymentStatus.PENDING,
              amount: total + (deposit ?? 0),
            },
          },
          conversation: {
            create: {
              listingId: listing.id,
              members: {
                create: [{ userId: buyerId }, { userId: listing.ownerId }],
              },
            },
          },
        },
        include: { items: true, payment: true },
      });

      // Escrow hold on payment authorize
      await tx.payment.update({
        where: { orderId: created.id },
        data: { status: PaymentStatus.AUTHORIZED, authorizedAt: new Date() },
      });

      const buyerWallet = await tx.wallet.upsert({
        where: { userId: buyerId },
        create: { userId: buyerId },
        update: {},
      });

      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data: { escrowBalance: { increment: created.total } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: buyerWallet.id,
          type: WalletTxnType.ESCROW_HOLD,
          amount: created.total,
          balanceAfter: Number(buyerWallet.escrowBalance) + Number(created.total),
          reference: created.orderNumber,
          description: `Escrow hold for ${created.orderNumber}`,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: buyerId,
          action: AuditAction.ORDER_STATUS,
          entityType: 'Order',
          entityId: created.id,
          metadata: { status: initialStatus },
        },
      });

      return created;
    });

    return order;
  }

  async transition(actorId: string, orderId: string, toStatus: OrderStatus, note?: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { payment: true },
    });
    if (!order) throw new NotFoundException({ code: 'ORDER_NOT_FOUND', message: 'Order not found' });

    const isSeller = order.sellerId === actorId;
    const isBuyer = order.buyerId === actorId;
    if (!isSeller && !isBuyer) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your order' });
    }

    const allowed = SELLER_TRANSITIONS[order.status] ?? [];
    if (isSeller && !allowed.includes(toStatus)) {
      throw new BadRequestException({
        code: 'INVALID_TRANSITION',
        message: `Cannot move from ${order.status} to ${toStatus}`,
      });
    }
    if (
      isBuyer &&
      toStatus !== OrderStatus.CANCELLED &&
      toStatus !== OrderStatus.COMPLETED
    ) {
      throw new BadRequestException({
        code: 'INVALID_TRANSITION',
        message: 'Buyers may only cancel or confirm completion',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: toStatus },
        include: { items: true, payment: true },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus,
          note,
          actorId,
        },
      });

      if (toStatus === OrderStatus.COMPLETED && order.payment?.status === PaymentStatus.AUTHORIZED) {
        await tx.payment.update({
          where: { orderId },
          data: { status: PaymentStatus.CAPTURED, capturedAt: new Date() },
        });

        const sellerWallet = await tx.wallet.upsert({
          where: { userId: order.sellerId },
          create: { userId: order.sellerId },
          update: {},
        });

        const earnings = Number(order.subtotal) - Number(order.platformFee);
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: { availableBalance: { increment: earnings } },
        });
        await tx.walletTransaction.create({
          data: {
            walletId: sellerWallet.id,
            type: WalletTxnType.ESCROW_RELEASE,
            amount: earnings,
            balanceAfter: Number(sellerWallet.availableBalance) + earnings,
            reference: order.orderNumber,
            description: `Settlement for ${order.orderNumber}`,
          },
        });

        const buyerWallet = await tx.wallet.findUnique({ where: { userId: order.buyerId } });
        if (buyerWallet) {
          await tx.wallet.update({
            where: { id: buyerWallet.id },
            data: { escrowBalance: { decrement: order.total } },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId,
          action: AuditAction.ORDER_STATUS,
          entityType: 'Order',
          entityId: orderId,
          metadata: { from: order.status, to: toStatus } as Prisma.InputJsonValue,
        },
      });

      return updated;
    });
  }
}
