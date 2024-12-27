import { StatusType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class OrderItem {
    @IsNumber()
    @IsNotEmpty()
    product_id: number;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}

export class CreateOrderDto {
    @IsOptional()
    @IsNumber()
    user_id: number;

    @IsNumber()
    @IsOptional()
    total_amount: number;

    @IsOptional()
    @IsEnum(StatusType)
    status: StatusType;

    @IsArray()
    @IsNotEmpty()
    @IsArray()
    @Type(() => OrderItem)
    order_items: OrderItem[];
}
