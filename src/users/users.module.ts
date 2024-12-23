import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesService } from 'src/roles/roles.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RolesService],
})
export class UsersModule {}
