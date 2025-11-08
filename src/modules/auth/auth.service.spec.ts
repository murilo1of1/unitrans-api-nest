import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Aluno } from '../alunos/entities/aluno.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { EmailService } from '../../common/services/email.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mockToken123'),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let emailService: EmailService;

  const mockAlunosRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEmpresasRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockEmailService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Aluno),
          useValue: mockAlunosRepository,
        },
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresasRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = {
      email: 'joao@test.com',
      senha: 'senha123',
    };

    it('deve retornar token JWT quando credenciais são válidas', async () => {
      const mockAluno = {
        id: 1,
        nome: 'João',
        email: 'joao@test.com',
        passwordHash: 'hashedPassword',
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAluno),
      };

      mockAlunosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        message: 'Sucesso',
        response: 'mock-jwt-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        idAluno: 1,
        nome: 'João',
        email: 'joao@test.com',
      });
    });

    it('deve lançar BadRequestException quando email não existe', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockAlunosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email não encontrado',
      );
    });

    it('deve lançar BadRequestException quando aluno não tem senha', async () => {
      const mockAluno = {
        id: 1,
        nome: 'João',
        email: 'joao@test.com',
        passwordHash: null,
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAluno),
      };

      mockAlunosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Aluno não possui senha cadastrada',
      );
    });

    it('deve lançar UnauthorizedException quando senha está incorreta', async () => {
      const bcrypt = require('bcrypt');

      const mockAluno = {
        id: 1,
        nome: 'João',
        email: 'joao@test.com',
        passwordHash: 'hashedPassword',
      };

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockAluno),
      };

      mockAlunosRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      bcrypt.compare.mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordDto = {
      email: 'joao@test.com',
    };

    it('deve enviar email com token de recuperação quando aluno existe', async () => {
      const mockAluno = {
        id: 1,
        email: 'joao@test.com',
      };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockAlunosRepository.update.mockResolvedValue(undefined);
      mockEmailService.sendMail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message:
          'Um e-mail com as instruções de recuperação foi enviado (se o e-mail existir em nosso sistema).',
      });
      expect(emailService.sendMail).toHaveBeenCalled();
      expect(mockAlunosRepository.update).toHaveBeenCalled();
    });

    it('deve retornar mesma mensagem quando aluno não existe (segurança)', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      const result = await service.forgotPassword(forgotPasswordDto);

      expect(result).toEqual({
        message:
          'Um e-mail com as instruções de recuperação foi enviado (se o e-mail existir em nosso sistema).',
      });
      expect(emailService.sendMail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      token: 'valid-token',
      newPassword: 'novaSenha123',
    };

    it('deve resetar senha com sucesso quando token é válido', async () => {
      const mockAluno = {
        id: 1,
        email: 'joao@test.com',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: Date.now() + 30 * 60 * 1000,
      };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockAlunosRepository.update.mockResolvedValue(undefined);

      const result = await service.resetPassword(resetPasswordDto);

      expect(result).toEqual({
        message: 'Senha redefinida com sucesso!',
      });
      expect(mockAlunosRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({
          passwordHash: expect.any(String),
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        }),
      );
    });

    it('deve lançar BadRequestException quando token é inválido', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Código de recuperação inválido ou expirado.',
      );
    });

    it('deve lançar BadRequestException quando token está expirado', async () => {
      // Token expirado - findOne não deve encontrar
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.resetPassword(resetPasswordDto)).rejects.toThrow(
        'Código de recuperação inválido ou expirado.',
      );
    });
  });
});
