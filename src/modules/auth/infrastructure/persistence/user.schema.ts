import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  username?: string;

  @Prop({ required: true, unique: true })
  email?: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ default: 'user' })
  role?: string;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
