import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HASH_SERVICE } from '../../domain/services/hash.service.interface';
import type { IHashService } from '../../domain/services/hash.service.interface';
import { TOKEN_SERVICE } from '../../domain/services/token.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';
import { EMAIL_SERVICE } from '../../domain/services/email.service.interface';
import type { IEmailService } from '../../domain/services/email.service.interface';
import { RegisterDto } from '../../interface-adapters/dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async execute(
    dto: RegisterDto,
    host: string,
    protocol: string,
  ): Promise<{ message: string }> {
    const existingUser = await this.userRepository.findByEmail(dto.email!);
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hashedPassword = await this.hashService.hash(dto.password!);
    const tokenVerifikasi = this.tokenService.generateRandomToken();

    const newUser = await this.userRepository.create({
      username: dto.username!,
      email: dto.email!,
      password: hashedPassword,
      role: dto.role || 'user',
      verificationToken: tokenVerifikasi,
      isVerified: false,
    });

    try {
      await this.emailService.sendVerificationEmail(
        newUser.email,
        newUser.username,
        tokenVerifikasi,
        host,
        protocol,
      );
      return { message: 'User terdaftar. Cek email kamu.' };
    } catch {
      await this.userRepository.update(newUser.id, {
        verificationToken: undefined,
      });
      throw new InternalServerErrorException('Gagal mengirim email verifikasi');
    }
  }
}
