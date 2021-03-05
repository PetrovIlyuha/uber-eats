import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtAuthService } from './jwt-auth.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'TEST_KEY';
const USER_ID = 12;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('json-webtoken-service', () => {
  let service: JwtAuthService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtAuthService>(JwtAuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('signing token', () => {
    it('should sign the jwt-token ', async () => {
      const token = service.sign(USER_ID);
      expect(typeof token).toBe('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, TEST_KEY, {
        expiresIn: '20d',
      });
    });
  });
  describe('jwt PERFORMS verify function', () => {
    it('should return decoded jwt-token', async () => {
      const decodedToken = service.verify('TOKEN');
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith('TOKEN', TEST_KEY);
      expect(decodedToken).toEqual({ id: USER_ID });
    });
  });
});
