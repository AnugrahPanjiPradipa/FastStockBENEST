import { Controller, Get } from '@nestjs/common';
import { GetAllGeraiUseCase } from '../../application/use-cases/get-all-gerai.use-case';

@Controller('api/gerai')
export class GeraiController {
  constructor(private readonly getAllGeraiUseCase: GetAllGeraiUseCase) {}

  @Get()
  async getAllGerai() {
    const geraiList = await this.getAllGeraiUseCase.execute();
    return {
      success: true,
      data: geraiList,
    };
  }
}
