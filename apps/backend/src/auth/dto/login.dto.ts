import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Email manzil' })
  @IsEmail({}, { message: 'To\'g\'ri email kiriting' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  @IsString()
  @MinLength(6, { message: 'Parol kamida 6 ta belgi bo\'lishi kerak' })
  password: string;
}



