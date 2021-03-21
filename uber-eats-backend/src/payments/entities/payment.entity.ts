import { User } from './../../users/entities/user.entity';
import { CoreEntity } from './../../common/entities/core.entity';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((_) => String)
  @Column()
  transactionId: string;

  @Field((_) => User)
  @ManyToOne((type) => User, (user) => user.payments, {
    onDelete: 'CASCADE',
    nullable: true,
    eager: true,
  })
  user: User;

  @Field(() => Restaurant)
  @ManyToOne((type) => Restaurant)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field((_) => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
