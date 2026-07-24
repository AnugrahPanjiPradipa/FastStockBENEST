import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ITEM_REPOSITORY } from '../../domain/repositories/item.repository.interface';
import type { IItemRepository } from '../../domain/repositories/item.repository.interface';

@Injectable()
export class DeleteItemUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY) private readonly itemRepository: IItemRepository,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async execute(id: string): Promise<boolean> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const item = await this.itemRepository.findById(id, session);
      if (!item)
        throw new NotFoundException('Item yang akan dihapus tidak ditemukan');

      await this.itemRepository.delete(id, session);
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal menghapus item');
    } finally {
      session.endSession();
    }
  }
}
