import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ITEM_REPOSITORY } from '../../domain/repositories/item.repository.interface';
import type { IItemRepository } from '../../domain/repositories/item.repository.interface';
import { ItemEntity } from '../../domain/entities/item.entity';
import { LOG_REPOSITORY } from '../../../log/domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../../log/domain/repositories/log.repository.interface';

@Injectable()
export class ProcessInventoryUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(
    id: string,
    actionType: string,
    jumlah: number,
    tujuan?: string,
  ): Promise<ItemEntity> {
    this.validateOperationalHours();

    if (!id) throw new BadRequestException('Parameter ID item tidak ditemukan');
    if (!actionType || actionType.trim() === '')
      throw new BadRequestException('Tipe aksi (actionType) wajib diisi');
    if (Number.isNaN(jumlah) || jumlah <= 0)
      throw new BadRequestException('Jumlah harus berupa angka positif');

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const item = await this.itemRepository.findById(id, session);
      if (!item)
        throw new NotFoundException('Data item tidak ditemukan di sistem');

      let updatedStockGudang = item.stockGudang;
      let updatedStockEtalase = item.stockEtalase;
      let logData: any = null;

      switch (actionType) {
        case 'mutasi':
          if (!item.hasEnoughGudangStock(jumlah)) {
            throw new BadRequestException(
              'Stok gudang tidak mencukupi untuk mutasi',
            );
          }
          updatedStockGudang -= jumlah;
          updatedStockEtalase += jumlah;
          logData = {
            itemId: item.id,
            itemName: item.name,
            type: 'mutasi',
            asal: item.asal,
            jumlah,
          };
          break;

        case 'penjualan':
          if (!item.hasEnoughEtalaseStock(jumlah)) {
            throw new BadRequestException(
              'Stok etalase tidak mencukupi untuk penjualan',
            );
          }
          updatedStockEtalase -= jumlah;
          logData = {
            itemId: item.id,
            itemName: item.name,
            type: 'penjualan',
            asal: item.asal,
            jumlah,
          };
          break;

        case 'transfer':
          if (!tujuan || tujuan.trim() === '') {
            throw new BadRequestException('Tujuan transfer wajib disertakan');
          }
          if (!item.hasEnoughGudangStock(jumlah)) {
            throw new BadRequestException(
              'Stok gudang tidak cukup untuk transfer',
            );
          }
          updatedStockGudang -= jumlah;
          logData = {
            itemId: item.id,
            itemName: item.name,
            type: 'transfer',
            tujuan,
            jumlah,
          };
          break;

        default:
          throw new BadRequestException('Tipe aksi tidak valid');
      }

      const updatedItem = await this.itemRepository.update(
        id,
        { stockGudang: updatedStockGudang, stockEtalase: updatedStockEtalase },
        session,
      );

      await this.logRepository.create(logData, session);

      await session.commitTransaction();
      return updatedItem!;
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Terjadi kesalahan sistem saat pemrosesan',
      );
    } finally {
      session.endSession();
    }
  }

  private validateOperationalHours(): void {
    const now = new Date();
    const wibHours = (now.getUTCHours() + 7) % 24;
    if (wibHours < 8 || wibHours >= 16) {
      throw new ForbiddenException(
        'Transaksi inventaris hanya diperbolehkan pada jam operasional (08:00 - 15:59 WIB).',
      );
    }
  }
}
