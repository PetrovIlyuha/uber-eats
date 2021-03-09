import { Field, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Category } from '../entities/category.entity';

@ObjectType()
export class AllCategoriesOutput extends BasicResponse {
  @Field((_) => [Category], { nullable: true })
  categories?: Category[];
}
