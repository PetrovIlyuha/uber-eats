import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends BasicResponse {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password', 'role']),
) {}
