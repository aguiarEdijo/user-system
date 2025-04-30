import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UsersModule } from './users/users.module';
import { typeOrmConfig } from './config/typeorm.config';
import * as redisStore from 'cache-manager-redis-store';

const getRedisConfig = () => ({
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  ttl: 30, // segundos
});

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    CacheModule.registerAsync({
      useFactory: () => getRedisConfig(),
    }),
    UsersModule,
  ],
})
export class AppModule { }