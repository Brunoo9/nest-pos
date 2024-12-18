import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  database: configService.get('DATABASE_NAME'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASS'),
  ssl: true,
  logging: true,
  entities: [join(__dirname + '../../**/*.entity.{js,ts}')],
  synchronize: true,
});
