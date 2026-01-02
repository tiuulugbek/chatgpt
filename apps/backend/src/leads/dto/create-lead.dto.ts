import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { LeadStatus, LeadSource } from '@prisma/client';

export class CreateContactDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateLeadDto {
  @ApiProperty({ example: 'Yangi murojaat' })
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: LeadStatus, required: false })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({ enum: LeadSource, required: false })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contactId?: string;

  @ApiProperty({ type: CreateContactDto, required: false })
  @IsOptional()
  @IsObject()
  contact?: CreateContactDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assigneeId?: string;
}



