import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { Inject, Injectable } from '@nestjs/common';
import { verifyEmailTemplate } from './verify-email.template';
import {
  MailerModuleOptions,
  EmailTemplateVariables,
} from './mailer.interfaces';
import * as sendGridMailer from '@sendgrid/mail';

@Injectable()
export class MailerService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailerModuleOptions,
  ) {
    sendGridMailer.setApiKey(options.sendGridApiKey);
    // this.sendEmail(activateAccountTemplate, {
    //   subject: 'Please activate your account with UberEaters',
    //   username: 'Ilya',
    //   code: 'secret',
    //   receiver: 'dnamix1@gmail.com',
    // });
  }

  sendEmail(
    template: (emailVariables: EmailTemplateVariables) => string,
    emailVariables: EmailTemplateVariables,
  ) {
    const emailData = {
      from: 'noreply@uber-eaters.io',
      to: emailVariables.receiver,
      subject: emailVariables.subject,
      html: template(emailVariables),
    };

    sendGridMailer
      .send(emailData)
      .then((sent) => {
        console.log('Account activation email was sent!', sent);
        return { message: 'Account activation email was sent!', sent };
      })
      .catch((err) => {
        console.log('email sending error: ', err);
        return { message: 'Email could not be sent' };
      });
  }

  public sendVerificationEmail(email: string, code: string) {
    this.sendEmail(verifyEmailTemplate, {
      subject: 'Verify Your Email',
      username: 'User',
      code,
      receiver: email,
    });
  }
}
