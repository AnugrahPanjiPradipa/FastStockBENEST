import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { HASH_SERVICE } from '../../domain/services/hash.service.interface';
import type { IHashService } from '../../domain/services/hash.service.interface';
import { TOKEN_SERVICE } from '../../domain/services/token.service.interface';
import type { ITokenService } from '../../domain/services/token.service.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(HASH_SERVICE) private readonly hashService: IHashService,
    @Inject(TOKEN_SERVICE) private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: any): Promise<any> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      throw new BadRequestException('Username tidak ditemukan');
    }

    const isMatch = await this.hashService.compare(
      dto.password,
      user.password || '',
    );
    if (!isMatch) {
      throw new BadRequestException('Password salah');
    }

    const tokenAktif = this.tokenService.generateJwtToken({
      id: user.id,
      role: user.role,
    });

    return {
      message: 'Login berhasil',
      token: tokenAktif,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
