import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItem, CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartsService {
  constructor(private readonly prismaService: PrismaService,
    private readonly productsService: ProductsService, 
  ){}
  async create(createCartDto: CreateCartDto) {
    const { user_id, cart_items } = createCartDto;
    
    const enhancedCartItems = await this.enhanceCartItemWithPrices(cart_items);

    let cartItems = [];

    return this.prismaService.$transaction(async (tx) => {
      // Create the cart
      const cart = await tx.cart.create({
        data: { user_id },
      });

      // Add the associated cart items
      enhancedCartItems.map(({ product_id, quantity, price }) =>
        cartItems.push({ cart_id: cart.id, product_id, quantity, price })
      );

      await tx.cartItem.createMany({
        data: cartItems,
      });

      return cart;
    });
  }

  async findAll(user_id: number) {
    return this.prismaService.cart.findMany({
      where: { user_id },
      include: {
        cart_items: { include: { products: true } },
      },
    });
  }

  async findOne(id: number, user_id: number) {
    const cart = await this.prismaService.cart.findFirst({
      where: { id, user_id },
      include: {
        cart_items: { include: { products : true } },
      },
    });

    if (!cart) {
      throw new NotFoundException(
        `Cart with ID ${id} not found for the user.`,
      );
    }

    return cart;
  }

  async update(id: number,user_id: number, updateCartDto: UpdateCartDto) {
    // include realtion cart item
    const cart = await this.prismaService.cart.findFirst({
      where: { id, user_id },
      include: {
        cart_items: true,
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found.`);
    }

    const {cart_items: newCartItems } = updateCartDto;

    // check if old cart items exist in new cart items
    // if not remove from old cart items
    // remove duplicate elements from cart items if exists
    // updateMany
    
    const newCartItemIds = newCartItems.map(item => item.product_id);

    const checkIfItemExists = cart.cart_items.filter(cart => !newCartItemIds.includes(cart.product_id));

    if (checkIfItemExists.length > 0) {
      await this.prismaService.cartItem.deleteMany({
        where: {
          cart_id: cart.id,
          product_id: { in: checkIfItemExists.map(item => item.product_id) },
        },
      });
    }

    let cartItems = [];
    newCartItems.map(({ product_id, quantity, price }) =>
      cartItems.push({ cart_id: cart.id, product_id, quantity, price })
    );

    return this.prismaService.cartItem.updateMany({
      data: newCartItems,
    });
  }

  async remove(id: number, user_id: number) {
    const cart = await this.prismaService.cart.findFirst({
      where: { id, user_id },
    });

    if (!cart) {
      throw new NotFoundException(
        `Cart with ID ${id} not found for the user.`,
      );
    }

      await this.prismaService.cart.delete({ where: { id } });
      return { message: 'Cart and associated items removed successfully.' };
  }
    private async enhanceCartItemWithPrices(cart_items: CartItem[]): Promise<CartItem[]> {
      const productIds = cart_items.map(item => item.product_id);
  
      // Fetch product details from the ProductsService
      const products = await this.productsService.findProductsByIds(productIds);
  
      const productPriceMap = new Map(products.map(product => [product.id, product.price]));
  
      return cart_items.map(item => {
        const price = productPriceMap.get(item.product_id);
        if (!price) {
          throw new NotFoundException(`Product with ID ${item.product_id} not found.`);
        }
        return { ...item, price };
      });
    }
}
