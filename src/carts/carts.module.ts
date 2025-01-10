import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  controllers: [CartsController],
  providers: [CartsService,PrismaService, ProductsService, CategoriesService],
})
export class CartsModule {}
