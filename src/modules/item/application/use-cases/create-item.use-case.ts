import {
  Injectable,
  Inject,
  BadRequestException,
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
export class CreateItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(dto: {
    name: string;
    stockGudang?: number;
    asal?: string;
  }): Promise<ItemEntity> {
    const initialStock = Number(dto.stockGudang) || 0;
    if (initialStock < 0) {
      throw new BadRequestException(
        'Stok awal harus berupa angka valid dan tidak negatif',
      );
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const newItem = await this.itemRepository.create(
        {
          name: dto.name,
          stockGudang: initialStock,
          stockEtalase: 0,
          asal: dto.asal || 'Gudang Utama',
        },
        session,
      );

      if (initialStock > 0) {
        await this.logRepository.create(
          {
            itemId: newItem.id,
            itemName: newItem.name,
            type: 'input',
            jumlah: initialStock,
            asal: newItem.asal,
          },
          session,
        );
      }

      await session.commitTransaction();
      return newItem;
    } catch {
      await session.abortTransaction();
      throw new InternalServerErrorException('Gagal membuat item');
    } finally {
      session.endSession();
    }
  }
}
