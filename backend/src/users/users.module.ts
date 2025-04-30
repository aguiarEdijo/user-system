import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { User } from './user.entity';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
  ],
  controllers: [UsersController],
  providers: [UsersService, LoggerService],
})
export class UsersModule { }