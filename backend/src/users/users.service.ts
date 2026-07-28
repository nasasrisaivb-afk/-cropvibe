import { Injectable, NotFoundException } from '@nestjs/common';
import { KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        roles: true,
        businesses: { include: { bankAccounts: true } },
        wallet: true,
      },
    });
    if (!user) throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'User not found' });
    const { passwordHash: _, ...safe } = user;
    return safe;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; location?: string; locale?: string; timezone?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        locale: true,
        timezone: true,
        kycStatus: true,
        activeRole: true,
      },
    });
  }

  async submitKyc(userId: string, docs: { docType: string; fileUrl: string }[]) {
    await this.prisma.kycDocument.createMany({
      data: docs.map((d) => ({ userId, docType: d.docType, fileUrl: d.fileUrl })),
    });
    return this.prisma.user.update({
      where: { id: userId },
      data: { kycStatus: KycStatus.PENDING },
      select: { id: true, kycStatus: true },
    });
  }
}
