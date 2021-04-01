import { BasicResponse } from './../../common/dtos/mutation-response.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@ObjectType()
export class OwnerRestaurantsOutput extends BasicResponse {
  @Field((type) => [Restaurant])
  restaurants?: Restaurant[];
}
