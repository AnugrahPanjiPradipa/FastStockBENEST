import { ItemEntity } from '../entities/item.entity';

export const ITEM_REPOSITORY = 'ITEM_REPOSITORY';

export interface PaginatedItems {
  items: ItemEntity[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface IItemRepository {
  findAll(
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedItems>;
  findById(id: string, session?: any): Promise<ItemEntity | null>;
  create(itemData: Partial<ItemEntity>, session?: any): Promise<ItemEntity>;
  update(
    id: string,
    itemData: Partial<ItemEntity>,
    session?: any,
  ): Promise<ItemEntity | null>;
  delete(id: string, session?: any): Promise<boolean>;
}
