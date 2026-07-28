import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleType, AuditAction } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async requestOtp(dto: RequestOtpDto) {
    const ttl = Number(this.config.get('OTP_TTL_SECONDS', 300));
    const demo = this.config.get('OTP_DEMO_CODE', '123456');
    const code =
      this.config.get('NODE_ENV') === 'production' ? String(randomInt(100000, 999999)) : demo;

    const codeHash = await bcrypt.hash(code, 10);
    await this.prisma.otpChallenge.create({
      data: {
        phone: dto.phone,
        codeHash,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    // SMS provider hook — demo returns code in non-production
    return {
      success: true,
      message: 'OTP sent',
      expiresInSeconds: ttl,
      ...(this.config.get('NODE_ENV') !== 'production' ? { demoCode: code } : {}),
    };
  }

  private async consumeOtp(phone: string, code: string) {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) throw new UnauthorizedException({ code: 'OTP_EXPIRED', message: 'OTP expired or not found' });
    if (challenge.attempts >= 5) {
      throw new UnauthorizedException({ code: 'OTP_LOCKED', message: 'Too many attempts' });
    }

    const ok = await bcrypt.compare(code, challenge.codeHash);
    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 }, consumed: ok },
    });
    if (!ok) throw new UnauthorizedException({ code: 'OTP_INVALID', message: 'Invalid OTP' });
  }

  private async issueTokens(userId: string, phone: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, phone });
    const refreshToken = createHash('sha256')
      .update(`${userId}:${Date.now()}:${randomInt(1e9)}`)
      .digest('hex');

    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: this.config.get('JWT_EXPIRES_IN', '7d') };
  }

  private serializeUser(user: {
    id: string;
    phone: string;
    email: string | null;
    name: string | null;
    location: string | null;
    kycStatus: string;
    activeRole: RoleType | null;
    phoneVerified: boolean;
    roles: { role: RoleType }[];
  }) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      location: user.location,
      kycStatus: user.kycStatus,
      activeRole: user.activeRole,
      phoneVerified: user.phoneVerified,
      roles: user.roles.map((r) => r.role),
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    await this.consumeOtp(dto.phone, dto.code);

    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { roles: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: dto.phone,
          phoneVerified: true,
          activeRole: RoleType.BUYER,
          roles: { create: [{ role: RoleType.BUYER, isPrimary: true }] },
          wallet: { create: {} },
        },
        include: { roles: true },
      });
    } else if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
        include: { roles: true },
      });
    }

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: AuditAction.LOGIN, entityType: 'User', entityId: user.id },
    });

    const tokens = await this.issueTokens(user.id, user.phone);
    return { user: this.serializeUser(user), ...tokens };
  }

  async register(dto: RegisterDto) {
    if (!dto.roles.length) throw new BadRequestException({ code: 'ROLES_REQUIRED', message: 'Select at least one role' });
    await this.consumeOtp(dto.phone, dto.code);

    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing?.phoneVerified) {
      throw new BadRequestException({ code: 'USER_EXISTS', message: 'Account already exists — sign in with OTP' });
    }

    const primary = dto.roles[0];
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        email: dto.email,
        name: dto.name,
        location: dto.location,
        phoneVerified: true,
        activeRole: primary,
        kycStatus: 'PENDING',
        roles: {
          create: dto.roles.map((role, i) => ({ role, isPrimary: i === 0 })),
        },
        businesses: dto.businessName
          ? { create: [{ name: dto.businessName, address: dto.location }] }
          : undefined,
        wallet: { create: {} },
      },
      include: { roles: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: AuditAction.KYC_SUBMIT,
        entityType: 'User',
        entityId: user.id,
        metadata: { roles: dto.roles },
      },
    });

    const tokens = await this.issueTokens(user.id, user.phone);
    return { user: this.serializeUser(user), ...tokens };
  }

  async switchRole(userId: string, role: RoleType) {
    const hasRole = await this.prisma.userRole.findUnique({
      where: { userId_role: { userId, role } },
    });
    if (!hasRole) throw new BadRequestException({ code: 'ROLE_MISSING', message: 'Role not on this account' });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { activeRole: role },
      include: { roles: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: AuditAction.ROLE_SWITCH,
        entityType: 'User',
        entityId: userId,
        metadata: { role },
      },
    });

    return { user: this.serializeUser(user) };
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.device.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: { actorId: userId, action: AuditAction.LOGOUT, entityType: 'User', entityId: userId },
    });
    return { success: true };
  }
}
