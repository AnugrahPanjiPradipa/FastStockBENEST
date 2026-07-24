import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'items' })
export class ItemDocument extends Document {
  @Prop({ required: true })
  name?: string;

  @Prop({ required: true, default: 0 })
  stockGudang?: number;

  @Prop({ required: true, default: 0 })
  stockEtalase?: number;

  @Prop({ default: 'Gudang Utama' })
  asal?: string;
}

export const ItemSchema = SchemaFactory.createForClass(ItemDocument);
