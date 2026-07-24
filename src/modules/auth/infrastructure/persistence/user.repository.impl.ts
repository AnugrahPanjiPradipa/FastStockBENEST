import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserDocument } from './user.schema';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private toEntity(doc: UserDocument): UserEntity {
    return new UserEntity(
      doc._id.toString(),
      doc.username ?? '',
      doc.email ?? '',
      doc.password ?? '',
      doc.role ?? '',
      doc.isVerified ?? false,
      doc.verificationToken,
      doc.resetPasswordToken,
      doc.resetPasswordExpires,
      (doc as any).createdAt,
      (doc as any).updatedAt,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findOne({ username }).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({ verificationToken: token })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findByResetToken(token: string): Promise<UserEntity | null> {
    const doc = await this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();
    return doc ? this.toEntity(doc) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.toEntity(doc) : null;
  }

  async create(userData: Partial<UserEntity>): Promise<UserEntity> {
    const created = new this.userModel(userData);
    const saved = await created.save();
    return this.toEntity(saved);
  }

  async update(
    id: string,
    userData: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    const updated = await this.userModel
      .findByIdAndUpdate(id, { $set: userData }, { new: true })
      .exec();
    return updated ? this.toEntity(updated) : null;
  }
}
