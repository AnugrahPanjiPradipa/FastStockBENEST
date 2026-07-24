import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { GeraiModule } from './modules/gerai/gerai.module';
import { LogModule } from './modules/log/log.module';
import { ItemModule } from './modules/item/item.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    GeraiModule,
    LogModule,
    ItemModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
