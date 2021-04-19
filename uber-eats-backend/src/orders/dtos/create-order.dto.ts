import { OrderItemOption } from './../entities/order-item.entity';
import { DishOption } from './../../restaurants/entities/dish.entity';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
class CreateOrderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends BasicResponse {
  @Field((type) => Int, { nullable: true })
  orderId?: number;
}
