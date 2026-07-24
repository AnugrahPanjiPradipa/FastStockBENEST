import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthCheck() {
    return {
      status: 'online',
      message: 'FastStock NestJS API is running smoothly!',
      timestamp: new Date().toISOString(),
    };
  }
}
