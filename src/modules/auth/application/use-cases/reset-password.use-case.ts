import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HASH_SERVICE } from '../../domain/services/hash.service.interface';
import type { IHashService } from '../../domain/services/hash.service.interface';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!token || !newPassword || newPassword.trim() === '') {
      throw new BadRequestException(
        'Data token atau password baru tidak valid',
      );
    }

    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new BadRequestException('Token tidak valid atau sudah kedaluwarsa');
    }

    const hashedPassword = await this.hashService.hash(newPassword);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return { message: 'Password berhasil direset.' };
  }
}
