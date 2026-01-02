import { PartialType } from '@nestjs/swagger';
import { CreateDealDto } from './create-deal.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DealStage } from '@prisma/client';

export class UpdateDealDto extends PartialType(CreateDealDto) {
  @ApiProperty({ enum: DealStage, required: false })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lostReason?: string;
}



