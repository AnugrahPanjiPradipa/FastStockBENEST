import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGeraiRepository } from '../../domain/repositories/gerai.repository.interface';
import { GeraiEntity } from '../../domain/entities/gerai.entity';
import { GeraiDocument } from './gerai.schema';

@Injectable()
export class GeraiRepositoryImpl implements IGeraiRepository {
  constructor(
    @InjectModel(GeraiDocument.name)
    private readonly geraiModel: Model<GeraiDocument>,
  ) {}

  async findAll(): Promise<GeraiEntity[]> {
    const docs = await this.geraiModel.find().exec();
    return docs.map(
      (doc) => new GeraiEntity(doc._id.toString(), doc.no ?? 0, doc.gerai),
    );
  }
}
