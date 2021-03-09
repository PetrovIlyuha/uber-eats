import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class RestaurauntInput {
  @Field((type) => Number)
  restaurantId: number;
}

@ObjectType()
export class RestaurantOutput extends BasicResponse {
  @Field((type) => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
