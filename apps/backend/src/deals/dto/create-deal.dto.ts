import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsDecimal } from 'class-validator';
import { DealStage } from '@prisma/client';

export class CreateDealDto {
  @ApiProperty({ example: 'Yangi bitim' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1000000, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: 'UZS', default: 'UZS', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: DealStage, required: false })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @IsNumber()
  probability?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}


