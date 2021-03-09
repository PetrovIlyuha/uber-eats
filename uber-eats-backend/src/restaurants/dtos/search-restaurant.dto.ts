import {
  PaginationInput,
  PaginationOutput,
} from './../../common/dtos/pagination.dto';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class SearchRestaurantInput extends PaginationInput {
  @Field((_) => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field((_) => [Restaurant], { nullable: true })
  results?: Restaurant[];
}
