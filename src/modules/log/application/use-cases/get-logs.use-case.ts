import { Injectable, Inject } from '@nestjs/common';
import { LOG_REPOSITORY } from '../../domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../domain/repositories/log.repository.interface';
import { LogEntity } from '../../domain/entities/log.entity';

@Injectable()
export class GetLogsUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(
    dateStr?: string,
    typeStr?: string,
    userRole?: string,
  ): Promise<LogEntity[]> {
    const queryFilter: any = {};

    // 1. Filter Tanggal (Range 1 Hari: >= date, < date + 1 day)
    if (dateStr && dateStr.trim() !== '') {
      const tanggalAwal = new Date(dateStr);
      const tanggalAkhir = new Date(dateStr);
      tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);
      queryFilter.createdAt = { $gte: tanggalAwal, $lt: tanggalAkhir };
    }

    // 2. Filter berdasarkan Role Klien (RBAC Logic Isolation)
    if (userRole === 'user') {
      if (!typeStr || typeStr === 'all') {
        queryFilter.type = { $in: ['mutasi', 'penjualan'] };
      } else if (typeStr === 'mutasi' || typeStr === 'penjualan') {
        queryFilter.type = typeStr;
      } else {
        // Jika user biasa mencoba akses tipe di luar mutasi & penjualan
        return [];
      }
    } else if (typeStr && typeStr !== 'all') {
      queryFilter.type = typeStr;
    }

    return await this.logRepository.findAll(queryFilter);
  }
}
