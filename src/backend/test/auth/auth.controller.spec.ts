import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  // Simplificamos los mocks a lo mínimo indispensable
  const mockService = {
    login: jest.fn(),
    verifyJwtToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: '123' };

    it('should return login result', async () => {
      const expectedResponse = { user: { id: 1 }, access_token: 'token' };
      mockService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      
      expect(result).toEqual(expectedResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });

    it('should throw if login fails', async () => {
      mockService.login.mockRejectedValue(new Error());
      await expect(controller.login(loginDto)).rejects.toThrow();
    });
  });

  describe('verify', () => {
    const token = 'jwt-123';

    it('should return decoded token when valid', async () => {
      const decodedData = { email: 'test@test.com' };
      mockService.verifyJwtToken.mockResolvedValue(decodedData);

      const result = await controller.verify(token);
      
      expect(result).toEqual({ valid: true, decoded: decodedData });
      expect(service.verifyJwtToken).toHaveBeenCalledWith(token);
    });

    it('should throw if token is invalid', async () => {
      mockService.verifyJwtToken.mockRejectedValue(new Error());
      await expect(controller.verify(token)).rejects.toThrow();
    });
  });
});