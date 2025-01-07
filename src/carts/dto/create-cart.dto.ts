import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CartItem {
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

export class CreateCartDto {
    @IsOptional()
    @IsNumber()
    user_id: number;

    @IsArray()
    @IsNotEmpty()
    @Type(() => CartItem)
    cart_items: CartItem[];
}
