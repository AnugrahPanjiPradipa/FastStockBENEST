import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { TOKEN_SERVICE } from '../../domain/services/token.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';
import { EMAIL_SERVICE } from '../../domain/services/email.service.interface';
import type { IEmailService } from '../../domain/services/email.service.interface';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
    @Inject(EMAIL_SERVICE) private readonly emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email tidak ditemukan di sistem');
    }

    const tokenReset = this.tokenService.generateRandomToken();
    const waktuKedaluwarsa = new Date();
    waktuKedaluwarsa.setMinutes(waktuKedaluwarsa.getMinutes() + 30);

    await this.userRepository.update(user.id, {
      resetPasswordToken: tokenReset,
      resetPasswordExpires: waktuKedaluwarsa,
    });

    try {
      await this.emailService.sendResetPasswordEmail(user.email, tokenReset);
      return { message: 'Email panduan reset password telah dikirim' };
    } catch {
      await this.userRepository.update(user.id, {
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });
      throw new InternalServerErrorException(
        'Gagal mengirim email reset password',
      );
    }
  }
}
