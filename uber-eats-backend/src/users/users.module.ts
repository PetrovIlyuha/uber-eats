import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { EmailVerificationEntity } from './entities/email-verify.entity';
import { User } from './entities/user.entity';
import { UsersResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailVerificationEntity])],
  providers: [UsersResolver, UserService],
  exports: [UserService],
})
export class UsersModule {}
