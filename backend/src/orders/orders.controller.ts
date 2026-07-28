import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderKind, OrderStatus, PaymentMethod } from '@prisma/client';
import { OrdersService } from './orders.service';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

class CheckoutDto {
  @ApiProperty()
  @IsString()
  listingId!: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @ApiPropertyOptional({ enum: OrderKind })
  @IsOptional()
  @IsEnum(OrderKind)
  kind?: OrderKind;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endAt?: string;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

class TransitionDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query('as') asRole: 'buyer' | 'seller' = 'seller',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orders.list(
      user.userId,
      asRole,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orders.get(user.userId, id);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: AuthUser, @Body() dto: CheckoutDto) {
    return this.orders.checkout(user.userId, dto);
  }

  @Patch(':id/status')
  transition(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: TransitionDto) {
    return this.orders.transition(user.userId, id, dto.status, dto.note);
  }
}
