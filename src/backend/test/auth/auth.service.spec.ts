import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'USER',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: { findByEmail: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('1d') } },
      ],
    }).compile();

    service = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  // ---------------- LOGIN ----------------
  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwtToken');

      const result = await service.login({ email: 'test@example.com', password: 'Password1!' });

      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password1!', mockUser.password);
      expect(result.access_token).toBe('jwtToken');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'wrong@test.com', password: 'Password1!' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'WrongPass' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------- VERIFY JWT ----------------
  describe('verifyJwtToken', () => {
    it('should return payload for valid token', async () => {
      jwtService.verify.mockReturnValue({ sub: 1 });
      const result = await service.verifyJwtToken('validToken');
      expect(result).toEqual({ sub: 1 });
      expect(jwtService.verify).toHaveBeenCalledWith('validToken');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error(); });

      await expect(service.verifyJwtToken('invalidToken'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});