import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar token JWT ao fazer login', async () => {
      const loginDto: LoginDto = {
        email: 'joao@test.com',
        senha: 'senha123',
      };

      const mockResponse = {
        message: 'Sucesso',
        response: 'mock-jwt-token',
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email de recuperação', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'joao@test.com',
      };

      const mockResponse = {
        message:
          'Um e-mail com as instruções de recuperação foi enviado (se o e-mail existir em nosso sistema).',
      };

      mockAuthService.forgotPassword.mockResolvedValue(mockResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toEqual(mockResponse);
      expect(service.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('deve resetar senha com sucesso', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'valid-token',
        newPassword: 'novaSenha123',
      };

      const mockResponse = {
        message: 'Senha redefinida com sucesso!',
      };

      mockAuthService.resetPassword.mockResolvedValue(mockResponse);

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toEqual(mockResponse);
      expect(service.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });
});
