import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
export class DeleteRestaurantInput {
  @Field((_) => Number)
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends BasicResponse {}
