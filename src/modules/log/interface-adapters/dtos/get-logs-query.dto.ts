import { IsOptional, IsString } from 'class-validator';

export class GetLogsQueryDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  type?: string;
}
