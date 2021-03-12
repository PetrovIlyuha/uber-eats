import { Dish } from './../../restaurants/entities/dish.entity';
import { User } from './../../users/entities/user.entity';
import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((_) => User)
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer: User;

  @Field((_) => User)
  @ManyToOne((type) => User, (user) => user.deliveries, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver: User;

  @Field((_) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant: Restaurant;

  @Field((_) => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dishes: Dish[];

  @Column()
  @Field((_) => Float)
  total: number;

  @Column({ type: 'enum', enum: OrderStatus })
  @Field((_) => OrderStatus)
  status: OrderStatus;
}
