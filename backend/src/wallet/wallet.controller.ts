import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { WalletService } from './wallet.service';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

class PayoutDto {
  @ApiProperty({ example: 10000 })
  @IsNumber()
  @Min(500)
  amount!: number;
}

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  summary(@CurrentUser() user: AuthUser) {
    return this.wallet.summary(user.userId);
  }

  @Get('transactions')
  transactions(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.wallet.transactions(
      user.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('payouts')
  payout(@CurrentUser() user: AuthUser, @Body() dto: PayoutDto) {
    return this.wallet.requestPayout(user.userId, dto.amount);
  }
}
