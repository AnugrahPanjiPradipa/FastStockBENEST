import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { ILogRepository } from '../../domain/repositories/log.repository.interface';
import { LogEntity } from '../../domain/entities/log.entity';
import { LogDocument } from './log.schema';

@Injectable()
export class LogRepositoryImpl implements ILogRepository {
  constructor(
    @InjectModel(LogDocument.name)
    private readonly logModel: Model<LogDocument>,
  ) {}

  private toEntity(doc: LogDocument): LogEntity {
    return new LogEntity(
      doc._id.toString(),
      doc.itemId ? doc.itemId.toString() : undefined,
      doc.itemName,
      doc.type,
      doc.jumlah,
      doc.asal,
      doc.tujuan,
      (doc as any).createdAt,
      (doc as any).updatedAt,
    );
  }

  async findAll(queryFilter: any = {}): Promise<LogEntity[]> {
    const docs = await this.logModel
      .find(queryFilter)
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.toEntity(doc));
  }

  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<LogEntity | null> {
    const query = this.logModel.findById(id);
    if (session) query.session(session);
    const doc = await query.exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(
    logData: Partial<LogEntity>,
    session?: ClientSession,
  ): Promise<LogEntity> {
    const created = new this.logModel(logData);
    const saved = await created.save({ session });
    return this.toEntity(saved);
  }

  async update(
    id: string,
    logData: Partial<LogEntity>,
    session?: ClientSession,
  ): Promise<LogEntity | null> {
    const updated = await this.logModel
      .findByIdAndUpdate(id, { $set: logData }, { new: true, session })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }

  async deleteById(id: string, session?: ClientSession): Promise<boolean> {
    const res = await this.logModel.deleteOne({ _id: id }, { session }).exec();
    return res.deletedCount > 0;
  }

  async deleteByDateRange(
    startDate: Date,
    endDate: Date,
    session?: ClientSession,
  ): Promise<number> {
    const res = await this.logModel
      .deleteMany({ createdAt: { $gte: startDate, $lt: endDate } }, { session })
      .exec();
    return res.deletedCount;
  }
}
