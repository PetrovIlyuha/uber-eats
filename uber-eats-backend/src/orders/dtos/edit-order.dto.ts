import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { BasicResponse } from "src/common/dtos/mutation-response.dto";
import { Order } from "../entities/order.entity";

@InputType()
export class EditOrderInput extends PickType(Order, ['id', 'status'] ) {}

@ObjectType()
export class EditOrderOutput extends BasicResponse {}
