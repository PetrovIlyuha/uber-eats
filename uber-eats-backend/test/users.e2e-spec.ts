import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EmailVerificationEntity } from 'src/users/entities/email-verify.entity';

const GRAPHQL_ENDPOINT = '/graphql';
const EMAIL = 'softclubplus@gmail.com';
const PASSWORD = 'sdfkj29dfjn';

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<EmailVerificationEntity>;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest().set('jwt-token', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<EmailVerificationEntity>>(
      getRepositoryToken(EmailVerificationEntity),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount', () => {
    it('should create new account', () => {
      return publicTest(`
        mutation {
          createAccount(input:{
            email: "${EMAIL}",
            password: "${PASSWORD}",
            role: Owner
          }) {
            error
            ok
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
        });
    });

    it('should fail if account exists', () => {
      return publicTest(
        `
          mutation {
            createAccount(input:{
              email: "${EMAIL}",
              password: "${PASSWORD}",
              role: Owner
            }) {
              error
              ok
            }
          }
      `,
      )
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            'The user with provided email already exists!',
          );
        });
    });
  });

  describe('login', () => {
    it('should be able to login with right credentials', () => {
      return publicTest(`
          mutation {
            login(input: {
              email: "${EMAIL}",
              password: "${PASSWORD}"
            }) {
              ok
              error
              token
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.ok).toBe(true);
          expect(res.body.data.login.error).toBe(null);
          expect(res.body.data.login.token).toEqual(expect.any(String));
          jwtToken = res.body.data.login.token;
        });
    });
    it('should be prevented from logging with wrong credentials', () => {
      return publicTest(`
          mutation {
            login(input: {
              email: "${EMAIL}",
              password: "${PASSWORD}-error"
            }) {
              ok
              error
              token
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.ok).toBe(false);
          expect(res.body.data.login.error).toBe('Your password is not valid!');
        });
    });
  });
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });
    it('should find a user profile', () => {
      return privateTest(`
        query {
          userProfile(userId: ${userId}) {
            ok
            error
            user {
              id
              role
              createdAt
            }
          }
        }`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.userProfile.user.id).toEqual(userId);
          expect(res.body.data.userProfile.error).toBe(null);
        });
    });
    it('should not find a user profile with non-existing user ID', () => {
      return privateTest(`
        query {
          userProfile(userId: 10) {
            ok
            error
            user {
              id
              role
              createdAt
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.userProfile.user).toBe(null);
          expect(res.body.data.userProfile.error).toEqual('User was not found');
          expect(res.body.data.userProfile.ok).toBe(false);
        });
    });
  });

  describe('me', () => {
    it('should return current active user profile', () => {
      return privateTest(`
            query {
              me {
                role
                email
              }
            }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(EMAIL);
        });
    });
    it('should  prevent getting profile info for not logged in users', () => {
      return publicTest(`
            query {
              me {
                role
                email
              }
            }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.errors[0].message).toEqual('Forbidden resource');
        });
    });
  });

  describe('editProfile', () => {
    it('should let user change email', () => {
      return privateTest(`
          mutation {
            editProfile(input:{
              email: "dnamix1@gmail.com",
            }) {
              ok
              error
            }
          }
      `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('verifyEmail', () => {
    let verificationCode: string;
    beforeAll(async () => {
      const [verification] = await verificationsRepository.find();
      verificationCode = verification.code;
    });
    it('should send email', () => {
      return publicTest(`
          mutation {
            verifyEmail(input: {code: "${verificationCode}") {
              ok
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });
});
