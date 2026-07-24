import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import {
  IItemRepository,
  PaginatedItems,
} from '../../domain/repositories/item.repository.interface';
import { ItemEntity } from '../../domain/entities/item.entity';
import { ItemDocument } from './item.schema';

@Injectable()
export class ItemRepositoryImpl implements IItemRepository {
  constructor(
    @InjectModel(ItemDocument.name)
    private readonly itemModel: Model<ItemDocument>,
  ) {}

  private toEntity(doc: ItemDocument): ItemEntity {
    return new ItemEntity(
      doc._id.toString(),
      doc.name!,
      doc.stockGudang!,
      doc.stockEtalase!,
      doc.asal!,
      (doc as any).createdAt,
      (doc as any).updatedAt,
    );
  }

  async findAll(
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedItems> {
    const skipData = (page - 1) * limit;
    const queryFilter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const docs = await this.itemModel
      .find(queryFilter)
      .skip(skipData)
      .limit(limit)
      .exec();
    const totalItems = await this.itemModel.countDocuments(queryFilter);

    return {
      items: docs.map((doc) => this.toEntity(doc)),
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    };
  }

  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<ItemEntity | null> {
    const query = this.itemModel.findById(id);
    if (session) query.session(session);
    const doc = await query.exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(
    itemData: Partial<ItemEntity>,
    session?: ClientSession,
  ): Promise<ItemEntity> {
    const created = new this.itemModel(itemData);
    const saved = await created.save({ session });
    return this.toEntity(saved);
  }

  async update(
    id: string,
    itemData: Partial<ItemEntity>,
    session?: ClientSession,
  ): Promise<ItemEntity | null> {
    const updated = await this.itemModel
      .findByIdAndUpdate(id, { $set: itemData }, { new: true, session })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async delete(id: string, session?: ClientSession): Promise<boolean> {
    const res = await this.itemModel.deleteOne({ _id: id }, { session }).exec();
    return res.deletedCount > 0;
  }
}
