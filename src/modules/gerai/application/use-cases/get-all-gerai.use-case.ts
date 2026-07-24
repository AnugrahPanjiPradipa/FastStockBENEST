import { Injectable, Inject } from '@nestjs/common';
import { GERAI_REPOSITORY } from '../../domain/repositories/gerai.repository.interface';
import type { IGeraiRepository } from '../../domain/repositories/gerai.repository.interface';
import { GeraiEntity } from '../../domain/entities/gerai.entity';

@Injectable()
export class GetAllGeraiUseCase {
  constructor(
    @Inject(GERAI_REPOSITORY)
    private readonly geraiRepository: IGeraiRepository,
  ) {}

  async execute(): Promise<GeraiEntity[]> {
    return await this.geraiRepository.findAll();
  }
}
