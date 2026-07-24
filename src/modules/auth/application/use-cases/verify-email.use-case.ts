import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    if (!token) throw new BadRequestException('Token verifikasi hilang');

    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException('Token verifikasi tidak valid');
    }

    await this.userRepository.update(user.id, {
      isVerified: true,
      verificationToken: undefined,
    });

    return { message: 'Email berhasil diverifikasi. Silakan login.' };
  }
}
