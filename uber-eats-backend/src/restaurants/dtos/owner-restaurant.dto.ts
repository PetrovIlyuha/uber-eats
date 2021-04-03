import { BasicResponse } from './../../common/dtos/mutation-response.dto';
import { Restaurant } from './../entities/restaurant.entity';
import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';

@InputType()
export class OwnerRestaurantInput {
  @Field((_) => Int)
  id?: number;
}

@ObjectType()
export class OwnerRestaurantOutput extends BasicResponse {
  @Field((_) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
