import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends BasicResponse {
  @Field((type) => String, { nullable: true })
  token?: string;
}
