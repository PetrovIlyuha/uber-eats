import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailerModuleOptions } from './mailer.interfaces';
import { MailerService } from './mailer.service';

@Module({})
@Global()
export class MailerModule {
  static forRoot(options: MailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: options,
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }
}
