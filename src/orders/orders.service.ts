import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, OrderItem } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService, // Inject the ProductsService
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { user_id, status, order_items } = createOrderDto;

    // Fetch product prices and calculate total amount
    const enhancedOrderItems =
      await this.enhanceOrderItemsWithPrices(order_items);
    const total_amount = this.calculateTotalAmount(enhancedOrderItems);

    return this.prismaService.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: { user_id, total_amount, status },
      });

      await Promise.all(
        enhancedOrderItems.map(({ product_id, quantity, price }) =>
          tx.orderItem.create({
            data: { order_id: order.id, product_id, quantity, price },
          }),
        ),
      );

      return order;
    });
  }

  async findAll(user_id: number) {
    return this.prismaService.order.findMany({
      where: { user_id },
      include: {
        order_items: { include: { product: true } },
      },
    });
  }

  async findOne(id: number, user_id: number) {
    const order = await this.prismaService.order.findFirst({
      where: { id, user_id },
      include: {
        order_items: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} not found for the user.`,
      );
    }

    return order;
  }

  async update(id: number, user_id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prismaService.order.findFirst({
      where: { id, user_id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    const { status, order_items } = updateOrderDto;

    return this.prismaService.$transaction(async (tx) => {
      // Update the order fields
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status },
      });

      if (order_items && order_items.length > 0) {
        const enhancedOrderItems =
          await this.enhanceOrderItemsWithPrices(order_items);
        const total_amount = this.calculateTotalAmount(enhancedOrderItems);

        await tx.order.update({
          where: { id },
          data: { total_amount },
        });

        await Promise.all(
          enhancedOrderItems.map(({ product_id, quantity, price }) =>
            tx.orderItem.upsert({
              where: { order_id_product_id: { order_id: id, product_id } },
              create: { order_id: id, product_id, quantity, price },
              update: { quantity, price },
            })
          )
        );
      }
  
      return updatedOrder;
    });
  }

  async remove(id: number, user_id: number) {
    const order = await this.prismaService.order.findFirst({
      where: { id, user_id },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} not found for the user.`,
      );
    }

      await this.prismaService.order.delete({ where: { id } });
      return { message: 'Order and associated items removed successfully.' };
    
  }

  // Helper function to calculate the total amount
  private calculateTotalAmount(order_items: OrderItem[]): number {
    return order_items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }

  // Helper function to fetch prices using ProductsService
  private async enhanceOrderItemsWithPrices(
    order_items: OrderItem[],
  ): Promise<OrderItem[]> {
    const productIds = order_items.map((item) => item.product_id);

    // Fetch product details from the ProductsService
    const products = await this.productsService.findProductsByIds(productIds);

    const productPriceMap = new Map(
      products.map((product) => [product.id, product.price]),
    );

    return order_items.map((item) => {
      const price = productPriceMap.get(item.product_id);
      if (!price) {
        throw new NotFoundException(
          `Product with ID ${item.product_id} not found.`,
        );
      }
      return { ...item, price };
    });
  }
}
