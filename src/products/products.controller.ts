import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtPayload } from 'src/types/jwt';
import { VendorGuard } from 'src/guards/vendor/vendor.guard';
import { Public } from 'src/helpers/public';


@UseGuards(VendorGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Req() request: JwtPayload,
    @Body() createProductDto: CreateProductDto) {
      createProductDto.user_id = request.payload.user_id;
      return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Req() request: JwtPayload) {
    return this.productsService.findAll(request.payload.user_id);
  }

  @Public()
  @Get('public')
  findAllForUsers() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(
    @Req() request: JwtPayload,
    @Param('id') id: string) {
    return this.productsService.findOne(+id,request.payload.user_id);
  }

  @Patch(':id')
  update(@Req() request: JwtPayload,
  @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id,request.payload.user_id, updateProductDto);
  }

  @Delete(':id')
  remove(@Req() request: JwtPayload,
  @Param('id') id: string) {
    return this.productsService.remove(+id, request.payload.user_id);
  }
}
