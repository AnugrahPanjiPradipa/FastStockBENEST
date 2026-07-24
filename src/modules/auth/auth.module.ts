import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Domain Contracts & Implementations
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { HASH_SERVICE } from './domain/services/hash.service.interface';
import { TOKEN_SERVICE } from './domain/services/token.service.interface';
import { EMAIL_SERVICE } from './domain/services/email.service.interface';

import {
  UserDocument,
  UserSchema,
} from './infrastructure/persistence/user.schema';
import { UserRepositoryImpl } from './infrastructure/persistence/user.repository.impl';
import { BcryptHashService } from './infrastructure/services/bcrypt-hash.service';
import { NestjsTokenService } from './infrastructure/services/nestjs-token.service';
import { NodemailerEmailService } from './infrastructure/services/nodemailer-email.service';

// Use Cases
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

// Controller & Guards
import { AuthController } from './interface-adapters/controllers/auth.controller';
import { JwtStrategy } from '../../shared/guards/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'supersecretjwtkeyfaststock2026',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    JwtStrategy,
    { provide: USER_REPOSITORY, useClass: UserRepositoryImpl },
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: NestjsTokenService },
    { provide: EMAIL_SERVICE, useClass: NodemailerEmailService },
  ],
  exports: [USER_REPOSITORY, JwtStrategy, PassportModule],
})
export class AuthModule {}
