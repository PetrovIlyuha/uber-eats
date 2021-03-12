import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';

@InputType()
export class DeleteDishInput {
  @Field((_) => Number)
  dishId: number;
}

@ObjectType()
export class DeleteDishOutput extends BasicResponse {}
