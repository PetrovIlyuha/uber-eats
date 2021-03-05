import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserService } from 'src/users/users.service';
import { JwtAuthService } from './jwt-auth.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtAuthService,
    private readonly userService: UserService,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if ('jwt-token' in req.headers) {
      const token = req.headers['jwt-token'];
      try {
        const decodedToken = this.jwtService.verify(token.toString());
        if (
          typeof decodedToken === 'object' &&
          decodedToken.hasOwnProperty('id')
        ) {
          const { user } = await this.userService.findById(decodedToken['id']);
          req['user'] = user;
        }
      } catch (error) {}
    }
    next();
  }
}
