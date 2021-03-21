import { Field, ObjectType } from '@nestjs/graphql';
import { BasicResponse } from 'src/common/dtos/mutation-response.dto';
import { Payment } from '../entities/payment.entity';

@ObjectType()
export class GetPaymentsOutput extends BasicResponse {
  @Field((_) => [Payment], { nullable: true })
  payments?: Payment[];
}
