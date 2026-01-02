import { PartialType } from '@nestjs/swagger';
import { CreateLeadDto } from './create-lead.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiProperty({ enum: LeadStatus, required: false })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}



