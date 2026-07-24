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
export class DeleteLogAndRollbackUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(logId: string): Promise<{ message: string }> {
    if (!logId) throw new BadRequestException('Parameter ID wajib diisi');

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const targetLog = await this.logRepository.findById(logId, session);
      if (!targetLog) throw new NotFoundException('Log tidak ditemukan');

      if (!targetLog.itemId) {
        await this.logRepository.deleteById(logId, session);
        await session.commitTransaction();
        return {
          message: 'Log dihapus (tanpa rollback stok karena tidak ada itemId)',
        };
      }

      const relatedItem = await this.itemRepository.findById(
        targetLog.itemId,
        session,
      );
      if (!relatedItem) {
        await this.logRepository.deleteById(logId, session);
        await session.commitTransaction();
        return { message: 'Item tidak ditemukan, log dihapus' };
      }

      // Revert Stok
      let newStockGudang = relatedItem.stockGudang;
      let newStockEtalase = relatedItem.stockEtalase;
      const amount = targetLog.jumlah || 0;

      if (targetLog.type === 'input') {
        newStockGudang -= amount;
      } else if (targetLog.type === 'mutasi') {
        newStockGudang += amount;
        newStockEtalase -= amount;
      } else if (targetLog.type === 'penjualan') {
        newStockEtalase += amount;
      } else if (
        targetLog.type === 'transfer' ||
        targetLog.type === 'pengurangan'
      ) {
        newStockGudang += amount;
      }

      if (newStockGudang < 0) newStockGudang = 0;
      if (newStockEtalase < 0) newStockEtalase = 0;

      await this.itemRepository.update(
        relatedItem.id,
        { stockGudang: newStockGudang, stockEtalase: newStockEtalase },
        session,
      );

      await this.logRepository.deleteById(logId, session);

      // Aturan Bisnis: Jika kedua stok habis (<= 0), hapus Item dari database
      if (newStockGudang <= 0 && newStockEtalase <= 0) {
        await this.itemRepository.delete(relatedItem.id, session);
        await session.commitTransaction();
        return {
          message: 'Log dihapus, stok rollback, item dihapus karena stok habis',
        };
      }

      await session.commitTransaction();
      return { message: 'Log berhasil dihapus dan stok dikembalikan' };
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Gagal menghapus log');
    } finally {
      session.endSession();
    }
  }
}
