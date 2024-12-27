import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtPayload } from 'src/types/jwt';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Req() request: JwtPayload,
    @Body() createOrderDto: CreateOrderDto) {
      createOrderDto.user_id = request.payload.user_id;
      return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Req() request: JwtPayload,) {
    return this.ordersService.findAll(request.payload.user_id);
  }

  @Get(':id')
  findOne(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.ordersService.findOne(+id,request.payload.user_id);
  }

  @Patch(':id')
  update(@Req() request: JwtPayload,
  @Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id,request.payload.user_id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.ordersService.remove(+id, request.payload.user_id);
  }
}
