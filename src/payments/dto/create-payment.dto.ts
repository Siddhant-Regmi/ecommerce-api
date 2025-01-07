import { PaymentStatus } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    order_id : number;

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
    @IsNotEmpty()
    amount: number;
}
