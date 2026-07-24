import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'logs' })
export class LogDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ItemDocument' })
  itemId?: string;

  @Prop()
  itemName?: string;

  @Prop()
  type?: string;

  @Prop()
  jumlah?: number;

  @Prop()
  asal?: string;

  @Prop()
  tujuan?: string;
}

export const LogSchema = SchemaFactory.createForClass(LogDocument);
