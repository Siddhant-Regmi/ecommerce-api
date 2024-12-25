import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    await this.checkIfCategoryExists(createCategoryDto.name);
    return this.prismaService.category.create({ data: createCategoryDto });
  }

  async findAll() {
    return this.prismaService.category.findMany();
  }

  async findOne(id: number) {
    return this.getCategory(id);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.getCategory(id);
    await this.checkIfCategoryExists(updateCategoryDto.name, id);
    return this.prismaService.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.getCategory(id);
    return this.prismaService.category.delete({ where: { id } });
  }

  async getCategory(id: number) {
    const category = await this.prismaService.category.findFirst({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async checkIfCategoryExists(name: string, id?: number) {
    const doesCategoryExist = await this.prismaService.category.findFirst({
      where: { name },
    });
    if (doesCategoryExist) {
      if (id && doesCategoryExist.id !== id) {
        //this is update case
        throw new BadRequestException(`Category ${name} already exists`);
      } else if (!id) {
        //this is create case
        throw new BadRequestException(`Category ${name} already exists`);
      }
    }
  }
}
