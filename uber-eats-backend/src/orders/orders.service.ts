import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import {
  NEW_PENDING_ORDER,
  PUB_SUB,
  NEW_READY_ORDER,
  NEW_ORDER_UPDATE,
} from './../common/common.constants';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return { ok: false, error: 'Could not find restaurant with given ID' };
      }
      let orderPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            ok: false,
            error: `One of the items in the order was not found for the restaurant`,
          };
        }

        let dishPrice = dish.price;
        for (const itemOption of item.options) {
          const optionOnDish = dish.options.find(
            (op) => op.name === itemOption.name,
          );
          if (optionOnDish) {
            if (optionOnDish.extra) {
              dishPrice += optionOnDish.extra;
            }
            const dishOptionsChoice = optionOnDish.choices.find(
              (ch) => ch.name == itemOption.choice,
            );
            if (dishOptionsChoice) {
              if (dishOptionsChoice.extra) {
                dishPrice += dishOptionsChoice.extra;
              }
            }
          }
        }
        orderPrice += dishPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderPrice,
          items: orderItems,
        }),
      );
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Failed to create an order!',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orders.find({
          where: { customer: user, ...(status && { status }) },
        });
        return { ok: true, orders };
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: { driver: user, ...(status && { status }) },
        });
        return { ok: true, orders };
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurants.find({
          where: { owner: user },
          relations: ['orders'],
        });
        orders = restaurants
          .map((place) => place.orders)
          .flat(1)
          .filter((order) => order.status === status);
        console.log(orders.map((o) => o.items));
        return { ok: true, error: null, orders };
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Failed to get orders!',
      };
    }
  }

  allowedToInvestigateOrder(user: User, order: Order): boolean {
    let userCanSeeOrder = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      userCanSeeOrder = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      userCanSeeOrder = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      userCanSeeOrder = false;
    }
    return userCanSeeOrder;
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return { ok: false, error: 'You order could not be found! Sorry' };
      }

      if (!this.allowedToInvestigateOrder(user, order)) {
        return {
          ok: false,
          error: `You are restrictred from viewing the order details!`,
        };
      }

      // console.log('order', order);
      return { ok: true, order };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not find your order!',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant', 'customer', 'driver'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      if (!this.allowedToInvestigateOrder(user, order)) {
        return {
          ok: false,
          error: `You are restrictred from editing the order!`,
        };
      }
      let userCanEditOrder = true;
      if (user.role === UserRole.Client) {
        userCanEditOrder = false;
      }
      if (user.role === UserRole.Owner) {
        if (
          status !== OrderStatus.ReadyForDelivery &&
          status !== OrderStatus.Cooking
        ) {
          userCanEditOrder = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          userCanEditOrder = false;
        }
      }
      console.log(user.role, order.status);
      if (!userCanEditOrder) {
        return {
          ok: false,
          error: "You can't edit order at this stage!",
        };
      }
      await this.orders.save({ id: orderId, status });
      const updatedOrder = { ...order, status };
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.ReadyForDelivery) {
          await this.pubSub.publish(NEW_READY_ORDER, {
            readyOrders: updatedOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: updatedOrder,
      });
      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: 'Order was not found',
        };
      }
      if (order.driver) {
        return {
          ok: false,
          error: 'This order has been picked by one of our drivers!',
        };
      }
      await this.orders.save({
        id: orderId,
        driver,
      });
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Order update failed for pick-up operation!',
      };
    }
  }
}

// customer token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTYxNTYzMDg4MiwiZXhwIjoxNjE3MzU4ODgyfQ.97LOUkFi3eJECKKQnFw7vkfkY9W-SR3p7Az5Agucgmc
// owner token   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImlhdCI6MTYxNTM4MjY1MCwiZXhwIjoxNjE3MTEwNjUwfQ.MWW02Eq9a0lVMU_mv2piZj4K3jI43askq8qnqYL9VdQ
// driver token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTMsImlhdCI6MTYxNTk4ODA5OSwiZXhwIjoxNjE3NzE2MDk5fQ.AUyugu66XQIUvgr-VpW7q_EoNQqvT9ovNBW-ZytOlFk
