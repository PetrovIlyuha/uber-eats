import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends BasicResponse {
  @Field((type) => Order, { nullable: true })
  order?: Order;
}
