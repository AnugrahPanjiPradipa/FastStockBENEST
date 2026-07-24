import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Username dan password wajib diisi' })
  @IsString()
  username?: string;

  @IsNotEmpty({ message: 'Username dan password wajib diisi' })
  @IsString()
  password?: string;
}
