import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envSchema } from './config/env.schema.js';

import { AuthModule } from './modules/shared/infrastructure/security/auth.module.js';
import { ItemsModule } from './modules/items/items.module.js';
import { MaterialsModule } from './modules/materials/materials.module.js';
import { SharedModule } from './modules/shared/shared.module.js';
import { TradingTablesModule } from './modules/trading-tables/trading-tables.module.js';
import { TreasureTablesModule } from './modules/treasure-tables/treasure-tables.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('RMU_MONGO_ITEMS_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SharedModule,
    ItemsModule,
    MaterialsModule,
    TradingTablesModule,
    TreasureTablesModule,
  ],
})
export class AppModule {}
