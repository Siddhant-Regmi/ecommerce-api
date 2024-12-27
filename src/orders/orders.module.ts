import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, ProductsService, CategoriesService],
})
export class OrdersModule {}
