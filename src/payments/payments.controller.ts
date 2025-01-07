import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtPayload } from 'src/types/jwt';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Req() request: JwtPayload, 
  @Body() createPaymentDto: CreatePaymentDto) {
    createPaymentDto.user_id = request.payload.user_id;
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(@Req() request: JwtPayload) {
    return this.paymentsService.findAll(request.payload.user_id);
  }

  @Get(':id')
  findOne(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.paymentsService.findOne(+id,request.payload.user_id);
  }

  @Patch(':id')
  update(@Req() request: JwtPayload,
  @Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id,request.payload.user_id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.paymentsService.remove(+id, request.payload.user_id);
  }
}
