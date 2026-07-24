import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GERAI_REPOSITORY } from './domain/repositories/gerai.repository.interface';
import {
  GeraiDocument,
  GeraiSchema,
} from './infrastructure/persistence/gerai.schema';
import { GeraiRepositoryImpl } from './infrastructure/persistence/gerai.repository.impl';

import { GetAllGeraiUseCase } from './application/use-cases/get-all-gerai.use-case';
import { GeraiController } from './interface-adapters/controllers/gerai.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GeraiDocument.name, schema: GeraiSchema },
    ]),
  ],
  controllers: [GeraiController],
  providers: [
    GetAllGeraiUseCase,
    {
      provide: GERAI_REPOSITORY,
      useClass: GeraiRepositoryImpl,
    },
  ],
  exports: [GetAllGeraiUseCase],
})
export class GeraiModule {}
