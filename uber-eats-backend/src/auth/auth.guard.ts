import { JwtAuthService } from './../jwt-auth/jwt-auth.service';
import { AllowedRoles } from './role.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
    private readonly jwtService: JwtAuthService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const decodedToken = this.jwtService.verify(token.toString());
      if (
        typeof decodedToken === 'object' &&
        decodedToken.hasOwnProperty('id')
      ) {
        const { user } = await this.userService.findById(decodedToken['id']);
        if (!user) {
          return false;
        }
        gqlContext['user'] = user;
        if (roles.includes('Anybody')) {
          return true;
        }
        return roles.includes(user.role);
      }
    }
    return false;
  }
}
