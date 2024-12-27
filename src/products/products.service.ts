import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    await this.categoriesService.findOne(createProductDto.category_id);
    const productExists = await this.prismaService.product.findFirst({
      where: {
        name: createProductDto.name,
        user_id: createProductDto.user_id,
      },
    });

    if (productExists) {
      throw new ConflictException(
        `Product ${createProductDto.name} already exists`,
      );
    }

    const product = await this.prismaService.product.create({
      data: createProductDto,
    });

    return product;
  }

  async findAll(user_id?: number) {
    return this.prismaService.product.findMany({
      ...(user_id && { where: { user_id } }),
    });
  }

  async findOne(id: number, user_id: number) {
    return this.getProduct(id, user_id);
  }

  async update(
    id: number,
    user_id: number,
    updateProductDto: UpdateProductDto,
  ) {
    await this.getProduct(id, user_id);
    await this.checkIfProductExists(updateProductDto.name, user_id, id);
    return this.prismaService.product.update({
      where: { id, user_id },
      data: updateProductDto,
    });
  }

  async remove(id: number, user_id: number) {
    await this.getProduct(id, user_id);
    return this.prismaService.product.delete({ where: { id, user_id } });
  }

  private async getProduct(id: number, user_id: number) {
    const product = await this.prismaService.product.findFirst({
      where: { id, user_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  private async checkIfProductExists(
    name: string,
    user_id: number,
    id?: number,
  ) {
    const doesProductExist = await this.prismaService.product.findFirst({
      where: { name, user_id },
    });
    if (doesProductExist) {
      if (id && doesProductExist.id !== id) {
        //this is update case
        throw new BadRequestException(`Product ${name} already exists`);
      } else if (!id) {
        //this is create case
        throw new BadRequestException(`Product ${name} already exists`);
      }
    }
  }

  async findProductsByIds(ids: number[]): Promise<{ id: number; price: number }[]> {
    // Check if the input IDs array is empty
    if (!ids || ids.length === 0) {
      throw new Error('No product IDs provided for lookup.');
    }
  
    try {
      const products = await this.prismaService.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, price: true },
      });
  
      // Ensure all IDs were found
      if (products.length !== ids.length) {
        throw new NotFoundException(`Some products were not found.`);
      }
  
      return products;
    } catch (error) {
      // Rethrow specific errors or throw a generic error
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch product details: ${error.message}`);
    }
  }
  
  
}
