import { JwtAuthService } from './../jwt-auth/jwt-auth.service';
import { UserService } from 'src/users/users.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { EmailVerificationEntity } from './entities/email-verify.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { Repository } from 'typeorm';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJWTService = {
  sign: jest.fn(() => 'auth-token'),
  verify: jest.fn(),
};

const mockMailer = {
  sendVerificationEmail: jest.fn(),
};

type MockRepositoty<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('User Service', () => {
  let service: UserService;
  let usersRepository: MockRepositoty<User>;
  let verificationsRepository: MockRepositoty<EmailVerificationEntity>;
  let emailService: MailerService;
  let jwtService: JwtAuthService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(EmailVerificationEntity),
          useValue: mockRepository(),
        },
        {
          provide: JwtAuthService,
          useValue: mockJWTService,
        },
        {
          provide: MailerService,
          useValue: mockMailer,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtAuthService>(JwtAuthService);
    verificationsRepository = module.get(
      getRepositoryToken(EmailVerificationEntity),
    );
    emailService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create account function', () => {
    const createAccountArgs = {
      email: 'test@gmail.com',
      password: 'firstcametomind',
      role: UserRole.Client,
    };
    it('should fail if user already exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@gmail.com',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'The user with provided email already exists!',
      });
    });
    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'super-email-code',
      });
      const createdAccount = await service.createAccount(createAccountArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(createdAccount).toEqual({ ok: true, error: null });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('Fatal crash'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        error: "Couldn't create new account! Try again later..",
      });
    });
  });

  describe('login', () => {
    const loginArgs = { email: 'dnamix1@gmail.com', password: '123pass' };
    it('should fail if user doest not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const failed = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(failed).toEqual({
        ok: false,
        error: 'User with given credentials not found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkGivenPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Your password is not valid!',
      });
    });

    it('should return token if password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkGivenPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'auth-token' });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Login Failed (:',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 120,
    };
    it('should find the user by id if existed', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(120);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });
    it('should fail if user not found in DB', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(12);
      expect(result).toEqual({ ok: false, error: 'User was not found' });
    });
  });

  describe('editProfile', () => {
    it('should change email correctly', async () => {
      const editProfileArgs = {
        userId: 120,
        input: { email: 'new@mail.com' },
      };
      const oldUser = {
        email: 'old@mail.com',
        emailVerified: true,
      };
      const newVerification = {
        code: 'email_code',
      };
      const updatedUser = {
        emailVerified: false,
        email: editProfileArgs.input.email,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);
      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);

      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: updatedUser,
      });
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        updatedUser.email,
        newVerification.code,
      );
    });
    it('should change password', async () => {
      const editProfilePasswordArgs = {
        userId: 1,
        input: { password: 'updated_password' },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'same old one' });
      const result = await service.editProfile(
        editProfilePasswordArgs.userId,
        editProfilePasswordArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledWith(
        editProfilePasswordArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true, error: null });
    });

    it('password change op should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(
        new Error('password change failed'),
      );
      const result = await service.editProfile(1, {
        email: 'frantic@mail.com',
      });
      expect(result).toEqual({
        ok: false,
        error: 'Password change operation have failed!',
      });
    });
  });
  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const fakeVerification = {
        user: {
          emailVerified: false,
        },
        id: 100,
      };
      verificationsRepository.findOne.mockResolvedValue(fakeVerification);
      const result = await service.verifyEmail('email-code');
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveReturnedTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({
        emailVerified: true,
      });

      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        fakeVerification.id,
      );
      expect(result).toEqual({ ok: true });
    });

    it('should fail if verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Verification not found' });
    });
    it('should fail on thrown exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('');
      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
});
