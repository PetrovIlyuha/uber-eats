import { Global, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput } from './dtos/login-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { EmailVerificationEntity } from './entities/email-verify.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
@Global()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(EmailVerificationEntity)
    private readonly verifications: Repository<EmailVerificationEntity>,
    private readonly jwtService: JwtAuthService,
    private readonly mailerService: MailerService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const existingUser = await this.users.findOne({ email });
      if (existingUser) {
        return {
          ok: false,
          error: 'The user with provided email already exists!',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailerService.sendVerificationEmail(user.email, verification.code);
      return { ok: true, error: null };
    } catch (error) {
      return {
        ok: false,
        error: "Couldn't create new account! Try again later..",
      };
    }
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User with given credentials not found',
        };
      }
      const isPasswordValid = await user.checkGivenPassword(password);
      if (!isPasswordValid) {
        return {
          ok: false,
          error: 'Your password is not valid!',
        };
      }
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Login Failed (:',
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail(id);
      return {
        ok: true,
        user,
      };
    } catch (err) {
      return { ok: false, error: 'User was not found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password, role }: EditProfileInput,
  ) {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        let emailTaken = await this.users.findOne({ email });
        if (emailTaken) {
          return {
            ok: false,
            error: 'Chosen email address belongs to another registered user!',
          };
        } else {
          user.email = email;
          user.emailVerified = false;
          await this.verifications.delete({ user: { id: user.id } });
          const verification = await this.verifications.save(
            this.verifications.create({ user }),
          );
          this.mailerService.sendVerificationEmail(
            user.email,
            verification.code,
          );
        }
      }
      if (password) user.password = password;
      if (role) user.role = role;
      await this.users.save(user);

      return { ok: true, error: null };
    } catch (error) {
      return {
        ok: false,
        error: 'Password change operation have failed!',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    console.log(code);

    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      console.log(verification);

      if (verification) {
        verification.user.emailVerified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return { ok: true, error: null };
      } else {
        return { ok: false, error: 'Verification not found' };
      }
    } catch (error) {
      return { ok: false, error: 'Could not verify email' };
    }
  }
}
