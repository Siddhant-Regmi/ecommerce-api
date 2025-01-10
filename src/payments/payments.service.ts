import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { user_id, cart_id, payment_type, payment_status, transaction_id } = createPaymentDto;

    const calculatedAmount = await this.calculateAmount(cart_id);

    switch (payment_type) {
      case 'COD':
        return await this.handleCOD(user_id, cart_id, calculatedAmount);
      case 'Bank Transfer':
        return await this.handleBankTransfer(user_id, cart_id, calculatedAmount, transaction_id);
      default:
        throw new BadRequestException('Payment type is not supported');
    }
  }

  async findAll(user_id: number) {
    return await this.prismaService.payment.findMany({
      where: { user_id },
    });
  }

  async findOne(id: number, user_id: number) {
    const payment = await this.prismaService.payment.findFirst({
      where: { id, user_id },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with ID ${id} not found for the user.`);
    }

    return payment;
  }

  async update(id: number, user_id: number, updatePaymentDto: UpdatePaymentDto) {
    const { payment_status } = updatePaymentDto;

    const payment = await this.prismaService.payment.findFirst({
      where: { id, user_id },
    });

    if (!payment) {
      throw new BadRequestException(`Payment with ID ${id} not found for the user.`);
    }

    // Update the payment status
    await this.prismaService.payment.update({
      where: { id },
      data: { payment_status },
    });

    return { message: 'Payment Status has been updated successfully' };
  }

  async remove(id: number, user_id: number) {
    const payment = await this.prismaService.payment.findFirst({
      where: { id, user_id },
    });
    if (!payment) {
      throw new BadRequestException(`Payment with ID ${id} not found for the user.`);
    }
    await this.prismaService.payment.delete({ where: { id } });
    return { message: 'Payment has been deleted successfully' };
  }

  // For COD
  private async handleCOD(
    user_id: number,
    cart_id: number,
    totalAmount: number,
  ): Promise<any> {
    return this.prismaService.$transaction(async (prisma) => {
      // Step 1: Create the Payment
      const payment = await prisma.payment.create({
        data: {
          user_id,
          cart_id,
          payment_type: 'COD',
          payment_status: 'Pending',
          amount: new Prisma.Decimal(totalAmount),
        },
      });

      // Step 2: Fetch Cart Items (to use as Order Items)
      const cartItems = await prisma.cartItem.findMany({
        where: { cart_id },
        select: {
          product_id: true,
          quantity: true,
          price: true,
        },
      });

      let order;

      if (cartItems.length > 0) {

      // Step 3: Create the Order
      order = await prisma.order.create({
        data: {
          user_id,
          total_amount: new Prisma.Decimal(totalAmount),
          status: 'Pending',
          payment_id: payment.id, // Link the payment directly here
          order_items: {
            create: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity || 0,
              price: item.price || new Prisma.Decimal(0),
            })),
          },
        },
      });
    }

      // Step 4: Delete the Cart
      await prisma.cart.delete({
        where: {
          id: cart_id,
        },
      });

      return order;
    });
  }

  // For Bank Transfer
  private async handleBankTransfer(
    user_id: number,
    cart_id: number,
    totalAmount: number,
    transaction_id?: string
  ): Promise<any> {
    if (!transaction_id) {
      throw new BadRequestException('Transaction ID is required for bank transfer');
    }

    return this.prismaService.$transaction(async (prisma) => {
      // Step 1: Create the Payment
      const payment = await prisma.payment.create({
        data: {
          user_id,
          cart_id,
          payment_type: 'Bank Transfer',
          payment_status: 'Pending',
          amount: new Prisma.Decimal(totalAmount),
          transaction_id,
        },
      });

      // Step 2: Fetch Cart Items
      const cartItems = await prisma.cartItem.findMany({
        where: { cart_id },
        select: {
          product_id: true,
          quantity: true,
          price: true,
        },
      });

      if (cartItems.length === 0) {
        throw new Error(`No items found in the cart with ID ${cart_id}`);
      }

      // Step 3: Create the Order
      const order = await prisma.order.create({
        data: {
          user_id,
          total_amount: new Prisma.Decimal(totalAmount),
          status: 'Pending',
          payment_id: payment.id, // Directly link payment to order
          order_items: {
            create: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity || 0,
              price: item.price || new Prisma.Decimal(0),
            })),
          },
        },
      });

      // Step 4: Delete the Cart
      await prisma.cart.delete({
        where: {
          id: cart_id,
        },
      });

      return order;
    });
  }

  // Calculate the amount of the cart using raw SQL
  private async calculateAmount(cart_id: number): Promise<number> {
    const result: { total: number | null }[] = await this.prismaService.$queryRawUnsafe(
      `
      SELECT SUM(quantity * price) as total
      FROM "cart_items"
      WHERE cart_id = $1
      `,
      cart_id
    );

    const totalAmount = result[0]?.total;

    if (totalAmount === null || totalAmount === undefined) {
      throw new BadRequestException(`No items found in the cart with ID ${cart_id}`);
    }

    return totalAmount; // Return the calculated total amount
  }
}
