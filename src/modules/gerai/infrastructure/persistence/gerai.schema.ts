import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'gerai' })
export class GeraiDocument extends Document {
  @Prop()
  no?: number;

  @Prop()
  gerai?: string;
}

export const GeraiSchema = SchemaFactory.createForClass(GeraiDocument);
