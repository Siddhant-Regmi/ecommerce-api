import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartsService } from 'src/carts/carts.service';
import { ProductsService } from 'src/products/products.service';
import { CategoriesService } from 'src/categories/categories.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, CartsService, ProductsService, CategoriesService],
})
export class PaymentsModule {}
