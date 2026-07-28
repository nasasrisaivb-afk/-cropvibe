import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ListingStatus, ListingType } from '@prisma/client';
import { ListingsService } from './listings.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

class CreateListingDto {
  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  type!: ListingType;

  @ApiProperty({ example: 'Organic Tomatoes — Grade A' })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(50)
  description!: string;

  @ApiProperty({ example: 'Vegetables' })
  @IsString()
  category!: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  moq?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  attributes?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  deposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

class StatusDto {
  @ApiProperty({ enum: ListingStatus })
  @IsEnum(ListingStatus)
  status!: ListingStatus;
}

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listings: ListingsService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  search(
    @Query('q') q?: string,
    @Query('type') type?: ListingType,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating',
  ) {
    return this.listings.search({
      q,
      type,
      category,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sort,
    });
  }

  @ApiBearerAuth()
  @Get('mine')
  mine(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.listings.mine(user.userId, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Public()
  @Get(':id')
  get(@Param('id') id: string) {
    return this.listings.getById(id);
  }

  @ApiBearerAuth()
  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    const me = await this.prisma.user.findUnique({ where: { id: user.userId } });
    return this.listings.create(user.userId, me?.kycStatus ?? 'NONE', dto);
  }

  @ApiBearerAuth()
  @Patch(':id/status')
  status(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: StatusDto) {
    return this.listings.updateStatus(user.userId, id, dto.status);
  }
}
