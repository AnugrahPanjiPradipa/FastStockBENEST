import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IHashService } from '../../domain/services/hash.service.interface';

@Injectable()
export class BcryptHashService implements IHashService {
  async hash(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainText, salt);
  }

  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hashedText);
  }
}
