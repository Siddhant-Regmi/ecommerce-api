import { PaymentStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
    @IsOptional()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    cart_id : number;

    @IsNotEmpty()
    @IsString()
    payment_type : String;

    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status : PaymentStatus;

    @IsString()
    @IsOptional()
    transaction_id? : string;

    @IsNumber()
    @IsOptional()
    amount: number;
}
