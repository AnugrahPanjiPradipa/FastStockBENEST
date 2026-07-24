import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LOG_REPOSITORY } from '../../domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../domain/repositories/log.repository.interface';

@Injectable()
export class DeleteLogsByDateUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(dateStr: string): Promise<number> {
    if (!dateStr || dateStr.trim() === '') {
      throw new BadRequestException('Tanggal wajib diisi');
    }

    try {
      const tanggalAwal = new Date(dateStr);
      const tanggalAkhir = new Date(dateStr);
      tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);

      return await this.logRepository.deleteByDateRange(
        tanggalAwal,
        tanggalAkhir,
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Gagal menghapus log');
    }
  }
}
