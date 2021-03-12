import { Dish } from './../entities/dish.entity';
import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
export class EditDishInput extends PickType(PartialType(Dish), [
  'name',
  'options',
  'price',
  'description',
]) {
  @Field((_) => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends BasicResponse {}
