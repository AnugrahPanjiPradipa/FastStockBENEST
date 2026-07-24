import { GeraiEntity } from '../entities/gerai.entity';

export const GERAI_REPOSITORY = 'GERAI_REPOSITORY';

export interface IGeraiRepository {
  findAll(): Promise<GeraiEntity[]>;
}
