import { CreateRestaurantInput } from './create-restaurant.dto';
import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput) {
  @Field((_) => Number)
  restaurantId: number;
}

@ObjectType()
export class EditRestaurantOutput extends BasicResponse {}
