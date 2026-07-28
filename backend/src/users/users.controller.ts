import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UsersService } from './users.service';
import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';

class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}

class KycDocDto {
  @ApiProperty({ example: 'AADHAAR' })
  @IsString()
  docType!: string;

  @ApiProperty({ example: 'https://cdn.example/kyc/aadhaar.jpg' })
  @IsString()
  fileUrl!: string;
}

class SubmitKycDto {
  @ApiProperty({ type: [KycDocDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KycDocDto)
  documents!: KycDocDto[];
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.users.me(user.userId);
  }

  @Patch('me')
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.userId, dto);
  }

  @Post('me/kyc')
  submitKyc(@CurrentUser() user: AuthUser, @Body() dto: SubmitKycDto) {
    return this.users.submitKyc(user.userId, dto.documents);
  }
}
