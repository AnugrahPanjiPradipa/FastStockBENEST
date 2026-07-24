import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { LOG_REPOSITORY } from '../../domain/repositories/log.repository.interface';
import type { ILogRepository } from '../../domain/repositories/log.repository.interface';
import { LogEntity } from '../../domain/entities/log.entity';

@Injectable()
export class UpdateLogUseCase {
  constructor(
    @Inject(LOG_REPOSITORY) private readonly logRepository: ILogRepository,
  ) {}

  async execute(id: string, payload: Partial<LogEntity>): Promise<LogEntity> {
    try {
      const updated = await this.logRepository.update(id, payload);
      if (!updated) {
        throw new NotFoundException('Log tidak ditemukan');
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Gagal memperbarui log');
    }
  }
}
