import { Injectable, Inject } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { LOG_REPOSITORY } from '../../domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../domain/repositories/log.repository.interface';

@Injectable()
export class ExportLogsExcelUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(dateStr?: string, typeStr?: string): Promise<Buffer> {
    const queryFilter: any = {};

    if (dateStr && dateStr.trim() !== '') {
      const tanggalAwal = new Date(dateStr);
      const tanggalAkhir = new Date(dateStr);
      tanggalAkhir.setDate(tanggalAkhir.getDate() + 1);
      queryFilter.createdAt = { $gte: tanggalAwal, $lt: tanggalAkhir };
    }

    if (typeStr && typeStr !== 'all') {
      queryFilter.type = typeStr;
    }

    const dataLogs = await this.logRepository.findAll(queryFilter);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Log');

    worksheet.columns = [
      { header: 'Tanggal', key: 'createdAt', width: 20 },
      { header: 'Item', key: 'itemName', width: 25 },
      { header: 'Jenis', key: 'type', width: 15 },
      { header: 'Asal', key: 'asal', width: 15 },
      { header: 'Tujuan', key: 'tujuan', width: 15 },
      { header: 'Jumlah', key: 'jumlah', width: 10 },
    ];

    dataLogs.forEach((log) => {
      worksheet.addRow({
        createdAt: log.createdAt
          ? dayjs(log.createdAt).format('YYYY-MM-DD HH:mm')
          : '-',
        itemName: log.itemName || '-',
        type: log.type || '-',
        asal: log.asal || '-',
        tujuan: log.tujuan || '-',
        jumlah: log.jumlah ?? 0,
      });
    });

    worksheet.getRow(1).font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }
}
