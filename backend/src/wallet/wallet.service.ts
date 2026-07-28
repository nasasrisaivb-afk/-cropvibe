import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, WalletTxnType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { pageMeta, paginate } from '../common/utils';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureWallet(userId: string) {
    return this.prisma.wallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  async summary(userId: string) {
    const wallet = await this.ensureWallet(userId);
    const recent = await this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return { wallet, recent };
  }

  async transactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.ensureWallet(userId);
    const { take, skip, page: p, limit: l } = paginate(page, limit);
    const where = { walletId: wallet.id };
    const [items, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);
    return { data: items, meta: pageMeta(total, p, l) };
  }

  async requestPayout(userId: string, amount: number) {
    if (amount < 500) {
      throw new BadRequestException({ code: 'MIN_PAYOUT', message: 'Minimum payout is ₹500' });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { businesses: { include: { bankAccounts: true } } },
    });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    if (user.kycStatus !== 'APPROVED') {
      throw new ForbiddenException({
        code: 'KYC_REQUIRED',
        message: 'KYC required before payouts',
      });
    }

    const bank = user.businesses.flatMap((b) => b.bankAccounts).find((a) => a.isPrimary);
    if (!bank) {
      throw new ForbiddenException({
        code: 'BANK_REQUIRED',
        message: 'Bank account required before first payout',
      });
    }

    const wallet = await this.ensureWallet(userId);
    if (Number(wallet.availableBalance) < amount) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_BALANCE',
        message: 'Insufficient available balance',
      });
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { availableBalance: { decrement: amount } },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxnType.PAYOUT,
          amount: -amount,
          balanceAfter: updated.availableBalance,
          description: 'Payout request',
        },
      });

      const payout = await tx.payoutRequest.create({
        data: {
          walletId: wallet.id,
          amount,
          status: 'pending',
          bankSnapshot: {
            holderName: bank.holderName,
            bankName: bank.bankName,
            accountNumber: bank.accountNumber.slice(-4),
            ifsc: bank.ifsc,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: AuditAction.PAYOUT_REQUEST,
          entityType: 'PayoutRequest',
          entityId: payout.id,
          metadata: { amount },
        },
      });

      return payout;
    });
  }
}
