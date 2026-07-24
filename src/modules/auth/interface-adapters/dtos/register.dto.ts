import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @IsString()
  username?: string;

  @IsNotEmpty({ message: 'Email wajib diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;

  @IsNotEmpty({ message: 'Password wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
