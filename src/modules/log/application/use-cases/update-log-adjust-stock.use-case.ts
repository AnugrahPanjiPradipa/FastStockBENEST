import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { LOG_REPOSITORY } from '../../domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../domain/repositories/log.repository.interface';
import { ITEM_REPOSITORY } from '../../../item/domain/repositories/item.repository.interface';
import type { IItemRepository } from '../../../item/domain/repositories/item.repository.interface';

@Injectable()
export class UpdateLogAndAdjustStockUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(id: string, body: any): Promise<{ message: string }> {
    if (!id) throw new BadRequestException('Parameter ID hilang');
    if (!body) throw new BadRequestException('Request body kosong');

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const targetLog = await this.logRepository.findById(id, session);
      if (!targetLog) throw new NotFoundException('Log tidak ditemukan');

      const idPencarianItem = body.itemId || targetLog.itemId;
      const targetItem = await this.itemRepository.findById(
        idPencarianItem,
        session,
      );
      if (!targetItem) throw new NotFoundException('Item tidak ditemukan');

      const requestJumlah = Number(body.jumlah);
      const requestType = body.type;

      // 1. Validasi Batas Stok
      if (
        (requestType === 'mutasi' && targetItem.stockGudang < requestJumlah) ||
        (requestType === 'transfer' && targetItem.stockGudang < requestJumlah)
      ) {
        throw new BadRequestException('Stok gudang tidak cukup');
      }

      if (
        requestType === 'penjualan' &&
        targetItem.stockEtalase < requestJumlah
      ) {
        throw new BadRequestException('Stok etalase tidak cukup');
      }

      let newGudang = targetItem.stockGudang;
      let newEtalase = targetItem.stockEtalase;
      const oldJumlah = targetLog.jumlah || 0;

      // 2. Revert Efek Log Lama
      if (targetLog.type === 'input') {
        newGudang -= oldJumlah;
      } else if (targetLog.type === 'mutasi') {
        newGudang += oldJumlah;
        newEtalase -= oldJumlah;
      } else if (targetLog.type === 'penjualan') {
        newEtalase += oldJumlah;
      } else if (
        targetLog.type === 'transfer' ||
        targetLog.type === 'pengurangan'
      ) {
        newGudang += oldJumlah;
      }

      // 3. Terapkan Efek Log Baru
      if (requestType === 'input') {
        newGudang += requestJumlah;
      } else if (requestType === 'mutasi') {
        newGudang -= requestJumlah;
        newEtalase += requestJumlah;
      } else if (requestType === 'penjualan') {
        newEtalase -= requestJumlah;
      } else if (requestType === 'transfer' || requestType === 'pengurangan') {
        newGudang -= requestJumlah;
      }

      // 4. Update Log Payload
      const updateLogPayload: any = {};
      if (body.itemId) updateLogPayload.itemId = body.itemId;
      if (body.itemName) updateLogPayload.itemName = body.itemName;
      if (requestType) updateLogPayload.type = requestType;
      if (!Number.isNaN(requestJumlah)) updateLogPayload.jumlah = requestJumlah;
      if (body.asal) updateLogPayload.asal = body.asal;
      if (body.tujuan) updateLogPayload.tujuan = body.tujuan;

      await this.itemRepository.update(
        targetItem.id,
        { stockGudang: newGudang, stockEtalase: newEtalase },
        session,
      );
      await this.logRepository.update(id, updateLogPayload, session);

      // Hapus Item jika kedua stok <= 0
      if (newGudang <= 0 && newEtalase <= 0) {
        await this.itemRepository.delete(targetItem.id, session);
      }

      await session.commitTransaction();
      return { message: 'Log berhasil diedit dan stok diperbarui' };
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Gagal edit log');
    } finally {
      session.endSession();
    }
  }
}
