import { Dish } from './../entities/dish.entity';
import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'photo',
  'description',
  'options',
]) {
  @Field((_) => Number)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends BasicResponse {}
