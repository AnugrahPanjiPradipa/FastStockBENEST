import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class ProcessInventoryDto {
  @IsNotEmpty({ message: 'Tipe aksi (actionType) wajib diisi' })
  @IsString()
  actionType?: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Jumlah harus berupa angka positif' })
  @Min(1)
  jumlah?: number;

  @IsOptional()
  @IsString()
  tujuan?: string;
}
