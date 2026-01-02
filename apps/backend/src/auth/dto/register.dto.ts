import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email manzil' })
  @IsEmail({}, { message: 'To\'g\'ri email kiriting' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgi bo\'lishi kerak' })
  password: string;

  @ApiProperty({ example: 'Ali', description: 'Ism' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Valiyev', description: 'Familiya' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'BRANCH_STAFF', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: 'clxxx', description: 'Filial ID', required: false })
  @IsOptional()
  @IsString()
  branchId?: string;
}



