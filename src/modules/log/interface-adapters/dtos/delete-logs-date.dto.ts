import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteLogsDateDto {
  @IsNotEmpty({ message: 'Tanggal wajib diisi' })
  @IsString()
  date?: string;
}
