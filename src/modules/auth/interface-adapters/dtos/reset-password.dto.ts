import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Password baru wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password?: string;
}
