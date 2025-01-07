import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtPayload } from 'src/types/jwt';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  create(@Req() request: JwtPayload,
  @Body() createCartDto: CreateCartDto) {
    createCartDto.user_id = request.payload.user_id;
    return this.cartsService.create(createCartDto);
  }

  @Get()
  findAll(@Req() request: JwtPayload,) {
    return this.cartsService.findAll(request.payload.user_id);
  }

  @Get(':id')
  findOne(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.cartsService.findOne(+id, request.payload.user_id);
  }

  @Patch(':id')
  update(@Req() request: JwtPayload,
  @Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartsService.update(+id, request.payload.user_id ,updateCartDto);
  }

  @Delete(':id')
  remove(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.cartsService.remove(+id, request.payload.user_id);
  }
}
