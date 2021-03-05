import { CONFIG_OPTIONS } from './../common/common.constants';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwtModuleOptions } from './jwt.interfaces';

@Module({})
@Global()
export class JwtAuthModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtAuthModule,
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        JwtAuthService,
      ],
      exports: [JwtAuthService],
    };
  }
}
