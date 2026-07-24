import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty({ message: 'Nama item wajib diisi' })
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Stok awal harus berupa angka valid dan tidak negatif' })
  stockGudang?: number;

  @IsOptional()
  @IsString()
  asal?: string;
}
