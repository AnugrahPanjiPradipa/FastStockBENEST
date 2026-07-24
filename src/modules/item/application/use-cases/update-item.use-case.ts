import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
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
export class UpdateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(
    id: string,
    dto: { name?: string; addStockGudang?: number; asal?: string },
  ): Promise<ItemEntity> {
    if (!id) throw new BadRequestException('ID item harus disertakan di URL');

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const item = await this.itemRepository.findById(id, session);
      if (!item)
        throw new NotFoundException('Item yang akan diupdate tidak ditemukan');

      const updatePayload: Partial<ItemEntity> = {};

      if (dto.name && dto.name.trim() !== '') {
        updatePayload.name = dto.name;
      }

      if (dto.addStockGudang !== undefined && dto.addStockGudang !== null) {
        const tambahanStok = Number(dto.addStockGudang);
        if (Number.isNaN(tambahanStok)) {
          throw new BadRequestException('Format penambahan stok tidak valid');
        }

        if (item.stockGudang + tambahanStok < 0) {
          throw new BadRequestException(
            'Perubahan stok menyebabkan stok menjadi negatif',
          );
        }

        updatePayload.stockGudang = item.stockGudang + tambahanStok;

        if (tambahanStok !== 0) {
          await this.logRepository.create(
            {
              itemId: item.id,
              itemName: dto.name || item.name,
              type: tambahanStok > 0 ? 'input' : 'pengurangan',
              jumlah: Math.abs(tambahanStok),
              asal: dto.asal || item.asal,
            },
            session,
          );
        }
      }

      const updated = await this.itemRepository.update(
        id,
        updatePayload,
        session,
      );
      await session.commitTransaction();
      return updated!;
    } catch (error) {
      await session.abortTransaction();
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      )
        throw error;
      throw new InternalServerErrorException('Gagal memproses pembaruan item');
    } finally {
      session.endSession();
    }
  }
}
