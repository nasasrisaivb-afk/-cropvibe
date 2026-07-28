import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, ListingType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { pageMeta, paginate, slugify } from '../common/utils';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: {
    q?: string;
    type?: ListingType;
    category?: string;
    page?: number;
    limit?: number;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  }) {
    const { take, skip, page, limit } = paginate(query.page, query.limit);
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.PUBLISHED,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { category: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
          ? { price: 'desc' }
          : query.sort === 'rating'
            ? { ratingAvg: 'desc' }
            : { publishedAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({ where, orderBy, take, skip }),
      this.prisma.listing.count({ where }),
    ]);

    return { data: items, meta: pageMeta(total, page, limit) };
  }

  async mine(ownerId: string, page = 1, limit = 20) {
    const { take, skip, page: p, limit: l } = paginate(page, limit);
    const where = { ownerId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({ where, orderBy: { updatedAt: 'desc' }, take, skip }),
      this.prisma.listing.count({ where }),
    ]);
    return { data: items, meta: pageMeta(total, p, l) };
  }

  async getById(id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: {
        owner: { select: { id: true, name: true, location: true, kycStatus: true } },
        availability: { orderBy: { startDate: 'asc' }, take: 60 },
      },
    });
    if (!listing) throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'Listing not found' });

    await this.prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return listing;
  }

  async create(
    ownerId: string,
    kycStatus: string,
    data: {
      type: ListingType;
      title: string;
      description: string;
      category: string;
      price: number;
      unit?: string;
      moq?: number;
      quantity?: number;
      location?: string;
      images?: string[];
      attributes?: Record<string, unknown>;
      deposit?: number;
      publish?: boolean;
    },
  ) {
    if (data.publish && kycStatus !== 'APPROVED') {
      throw new ForbiddenException({
        code: 'KYC_REQUIRED',
        message: 'KYC approval required before publishing listings',
      });
    }

    const baseSlug = slugify(data.title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const status = data.publish ? ListingStatus.PENDING_REVIEW : ListingStatus.DRAFT;

    return this.prisma.listing.create({
      data: {
        ownerId,
        type: data.type,
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        price: data.price,
        unit: data.unit,
        moq: data.moq,
        quantity: data.quantity,
        location: data.location,
        images: data.images ?? [],
        attributes: data.attributes as Prisma.InputJsonValue,
        deposit: data.deposit,
        status,
        publishedAt: data.publish ? new Date() : null,
      },
    });
  }

  async updateStatus(ownerId: string, id: string, status: ListingStatus) {
    const listing = await this.prisma.listing.findFirst({ where: { id, deletedAt: null } });
    if (!listing) throw new NotFoundException({ code: 'LISTING_NOT_FOUND', message: 'Listing not found' });
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not your listing' });
    }
    return this.prisma.listing.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ListingStatus.PUBLISHED ? new Date() : listing.publishedAt,
      },
    });
  }
}
