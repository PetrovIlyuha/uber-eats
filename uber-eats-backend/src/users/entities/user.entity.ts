import { Order } from './../../orders/entities/order.entity';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Payment } from 'src/payments/entities/payment.entity';

export enum UserRole {
  Owner = 'Owner',
  Client = 'Client',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field((returns) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((returns) => String)
  @IsString()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @IsEnum(UserRole)
  @Field((returns) => UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field((_) => Boolean)
  @IsBoolean()
  emailVerified: boolean;

  @Field(() => [Restaurant])
  @OneToMany((type) => Restaurant, (restaurant) => restaurant.owner, {eager: true})
  restaurants: Restaurant[];

  @Field(() => [Order])
  @OneToMany((type) => Order, (order) => order.customer)
  orders: Order[];

  @Field(() => [Order])
  @OneToMany((type) => Order, (order) => order.driver)
  deliveries: Order[];

  @Field(() => [Payment])
  @OneToMany((type) => Payment, (payment) => payment.user)
  payments: Payment[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log('hashing password error', error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkGivenPassword(password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }
}
