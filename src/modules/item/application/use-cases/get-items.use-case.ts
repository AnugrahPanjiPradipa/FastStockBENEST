import { Injectable, Inject } from '@nestjs/common';
import {
  ITEM_REPOSITORY,
  PaginatedItems,
} from '../../domain/repositories/item.repository.interface';
import type { IItemRepository } from '../../domain/repositories/item.repository.interface';

@Injectable()
export class GetItemsUseCase {
  constructor(
    @Inject(ITEM_REPOSITORY)
    private readonly itemRepository: IItemRepository,
  ) {}

  async execute(
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedItems> {
    return await this.itemRepository.findAll(search, page, limit);
  }
}
