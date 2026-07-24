import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ITokenService } from '../../domain/services/token.service.interface';

@Injectable()
export class NestjsTokenService implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwtToken(payload: { id: string; role: string }): string {
    return this.jwtService.sign(payload);
  }

  generateRandomToken(): string {
    return crypto.randomBytes(20).toString('hex');
  }
}
