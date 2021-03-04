import { verifyEmailTemplate } from './verify-email.template';
import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailerService } from './mailer.service';

const emailVariables = {
  subject: 'Verify Your Email',
  username: 'User',
  code: 'verify-email-code',
  receiver: 'user@gmail.com',
};

describe('MailerService', () => {
  let service: MailerService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            sendGridApiKey: 'SG.MAIL_TEST_KEY',
          },
        },
      ],
    }).compile();
    service = module.get<MailerService>(MailerService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('it should send verification email', () => {
    it('should call sendGrid', () => {
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {});
      service.sendVerificationEmail(
        emailVariables.receiver,
        emailVariables.code,
      );
      expect(service.sendEmail).toHaveBeenCalledWith(verifyEmailTemplate, {
        ...emailVariables,
      });
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
