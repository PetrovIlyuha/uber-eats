import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
]) {
  @Field(() => String)
  categoryName: string;

  @Field(() => String, { nullable: true })
  categoryImage?: string;
}

@ObjectType()
export class CreateRestaurantOutput extends BasicResponse {
  @Field((_) => Int, { nullable: true })
  restaurantId?: number;
}
