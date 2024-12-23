import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createRoleDto: CreateRoleDto) {
    await this.checkIfRoleExists(createRoleDto.name);
    return this.prismaService.role.create({ data: createRoleDto });
  }

  async findAll() {
    return this.prismaService.role.findMany();
  }

  async findOne(id: number) {
    return this.getRole(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    await this.getRole(id);
    await this.checkIfRoleExists(updateRoleDto.name, id);
    return this.prismaService.role.update({ where: { id }, data: updateRoleDto });
  }

  async remove(id: number) {
    await this.getRole(id);
    return this.prismaService.role.delete({ where: { id } }) ;
  }

  private async getRole(id: number) {
    const role = await this.prismaService.role.findFirst({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  private async checkIfRoleExists(name: string, id?: number) {
    const doesroleExist = await this.prismaService.role.findFirst({
      where: { name },
    });
    if (doesroleExist) {
      if (id && doesroleExist.id !== id) {
        //this is update case
        throw new BadRequestException(`Role ${name} already exists`);
      } else if (!id) {
        //this is create case
        throw new BadRequestException(`Role ${name} already exists`);
      }
    }
  }
}
