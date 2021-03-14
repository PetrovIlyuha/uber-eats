import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Order, OrderStatus } from '../entities/order.entity';

@InputType()
export class GetOrdersInput {
  @Field((type) => OrderStatus, { nullable: true })
  status?: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends BasicResponse {
  @Field((type) => [Order], { nullable: true })
  orders?: Order[];
}
