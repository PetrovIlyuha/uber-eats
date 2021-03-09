import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { EmailVerificationEntity } from '../entities/email-verify.entity';

@ObjectType()
export class VerifyEmailOutput extends BasicResponse {}

@InputType()
export class VerifyEmailInput extends PickType(EmailVerificationEntity, [
  'code',
]) {}
