import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field((_) => Number)
  userId: string;
}

@ObjectType()
export class UserProfileOutput extends BasicResponse {
  @Field((_) => User, { nullable: true })
  user?: User;
}
