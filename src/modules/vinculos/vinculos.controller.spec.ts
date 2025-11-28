import { Test, TestingModule } from '@nestjs/testing';
import { VinculosController } from './vinculos.controller';
import { VinculosService } from './vinculos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatusSolicitacao } from './entities/solicitacao-vinculo.entity';

describe('VinculosController', () => {
  let controller: VinculosController;
  let service: VinculosService;

  const mockVinculosService = {
    criarVinculo: jest.fn(),
    listarVinculos: jest.fn(),
    listarVinculosAluno: jest.fn(),
    listarVinculosEmpresa: jest.fn(),
    desativarVinculo: jest.fn(),
    reativarVinculo: jest.fn(),
    gerarToken: jest.fn(),
    listarTokens: jest.fn(),
    listarTokensEmpresa: jest.fn(),
    revogarToken: jest.fn(),
    vincularPorToken: jest.fn(),
    solicitarVinculo: jest.fn(),
    listarSolicitacoes: jest.fn(),
    listarSolicitacoesEmpresa: jest.fn(),
    listarSolicitacoesAluno: jest.fn(),
    aprovarSolicitacao: jest.fn(),
    rejeitarSolicitacao: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VinculosController],
      providers: [
        {
          provide: VinculosService,
          useValue: mockVinculosService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<VinculosController>(VinculosController);
    service = module.get<VinculosService>(VinculosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarVinculo', () => {
    it('deve criar vínculo e retornar mensagem de sucesso', async () => {
      const dto = {
        empresaId: 1,
        alunoId: 1,
        origemVinculo: 'manual' as const,
        vinculadoPor: 'Admin',
      };
      const vinculo = { id: 1, ...dto };

      mockVinculosService.criarVinculo.mockResolvedValue(vinculo);

      const result = await controller.criarVinculo(dto);

      expect(result).toEqual({
        message: 'Vínculo criado com sucesso!',
        data: vinculo,
      });
      expect(service.criarVinculo).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarVinculos', () => {
    it('deve listar vínculos com filtros', async () => {
      const filterDto = { empresaId: 1, alunoId: 1 };
      const vinculos = [{ id: 1, empresaId: 1, alunoId: 1 }];

      mockVinculosService.listarVinculos.mockResolvedValue(vinculos);

      const result = await controller.listarVinculos(filterDto);

      expect(result).toEqual({
        message: 'Vínculos encontrados',
        data: vinculos,
      });
      expect(service.listarVinculos).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('listarVinculosAluno', () => {
    it('deve listar vínculos de um aluno', async () => {
      const vinculos = [{ id: 1, alunoId: 1 }];
      mockVinculosService.listarVinculosAluno.mockResolvedValue(vinculos);

      const result = await controller.listarVinculosAluno(1);

      expect(result).toEqual({
        message: 'Vínculos do aluno encontrados',
        data: vinculos,
      });
      expect(service.listarVinculosAluno).toHaveBeenCalledWith(1, undefined);
    });

    it('deve listar vínculos ativos de um aluno', async () => {
      const vinculos = [{ id: 1, alunoId: 1, ativo: true }];
      mockVinculosService.listarVinculosAluno.mockResolvedValue(vinculos);

      const result = await controller.listarVinculosAluno(1, 'true');

      expect(result.data).toEqual(vinculos);
      expect(service.listarVinculosAluno).toHaveBeenCalledWith(1, true);
    });

    it('deve listar vínculos inativos de um aluno', async () => {
      const vinculos = [{ id: 1, alunoId: 1, ativo: false }];
      mockVinculosService.listarVinculosAluno.mockResolvedValue(vinculos);

      const result = await controller.listarVinculosAluno(1, 'false');

      expect(result.data).toEqual(vinculos);
      expect(service.listarVinculosAluno).toHaveBeenCalledWith(1, false);
    });
  });

  describe('listarVinculosEmpresa', () => {
    it('deve listar vínculos de uma empresa', async () => {
      const vinculos = [{ id: 1, empresaId: 1 }];
      mockVinculosService.listarVinculosEmpresa.mockResolvedValue(vinculos);

      const result = await controller.listarVinculosEmpresa(1);

      expect(result).toEqual({
        message: 'Vínculos da empresa encontrados',
        data: vinculos,
      });
      expect(service.listarVinculosEmpresa).toHaveBeenCalledWith(1, undefined);
    });
  });

  describe('desativarVinculo', () => {
    it('deve desativar vínculo e retornar mensagem de sucesso', async () => {
      mockVinculosService.desativarVinculo.mockResolvedValue(undefined);

      const result = await controller.desativarVinculo(1);

      expect(result).toEqual({
        message: 'Vínculo desativado com sucesso!',
      });
      expect(service.desativarVinculo).toHaveBeenCalledWith(1);
    });
  });

  describe('reativarVinculo', () => {
    it('deve reativar vínculo e retornar mensagem de sucesso', async () => {
      mockVinculosService.reativarVinculo.mockResolvedValue(undefined);

      const result = await controller.reativarVinculo(1);

      expect(result).toEqual({
        message: 'Vínculo reativado com sucesso!',
      });
      expect(service.reativarVinculo).toHaveBeenCalledWith(1);
    });
  });

  describe('gerarToken', () => {
    it('deve gerar token e retornar mensagem de sucesso', async () => {
      const dto = { empresaId: 1 };
      const tokenResult = { token: 'ABC12345', id: 1 };

      mockVinculosService.gerarToken.mockResolvedValue(tokenResult);

      const result = await controller.gerarToken(dto);

      expect(result).toEqual({
        message: 'Token de acesso gerado com sucesso!',
        data: tokenResult,
      });
      expect(service.gerarToken).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarTokens', () => {
    it('deve listar tokens', async () => {
      const tokens = [{ id: 1, token: 'ABC' }];
      mockVinculosService.listarTokens.mockResolvedValue(tokens);

      const result = await controller.listarTokens(undefined);

      expect(result).toEqual({
        message: 'Tokens encontrados',
        data: tokens,
      });
      expect(service.listarTokens).toHaveBeenCalledWith(undefined);
    });

    it('deve listar tokens com filtro de empresa', async () => {
      const tokens = [{ id: 1, empresaId: 1 }];
      mockVinculosService.listarTokens.mockResolvedValue(tokens);

      const result = await controller.listarTokens(1);

      expect(result.data).toEqual(tokens);
      expect(service.listarTokens).toHaveBeenCalledWith(1);
    });
  });

  describe('listarTokensEmpresa', () => {
    it('deve listar tokens de uma empresa', async () => {
      const tokens = [{ id: 1, empresaId: 1 }];
      mockVinculosService.listarTokensEmpresa.mockResolvedValue(tokens);

      const result = await controller.listarTokensEmpresa(1);

      expect(result).toEqual({
        message: 'Tokens da empresa encontrados',
        data: tokens,
      });
      expect(service.listarTokensEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('revogarToken', () => {
    it('deve revogar token e retornar mensagem de sucesso', async () => {
      mockVinculosService.revogarToken.mockResolvedValue(undefined);

      const result = await controller.revogarToken(1);

      expect(result).toEqual({
        message: 'Token revogado com sucesso!',
      });
      expect(service.revogarToken).toHaveBeenCalledWith(1);
    });
  });

  describe('vincularPorToken', () => {
    it('deve vincular por token e retornar mensagem de sucesso', async () => {
      const dto = { token: 'ABC12345', alunoId: 1 };
      const vinculo = { id: 1, empresaId: 1, alunoId: 1 };

      mockVinculosService.vincularPorToken.mockResolvedValue(vinculo);

      const result = await controller.vincularPorToken(dto);

      expect(result).toEqual({
        message: 'Vínculo criado via token com sucesso!',
        data: vinculo,
      });
      expect(service.vincularPorToken).toHaveBeenCalledWith(dto);
    });
  });

  describe('solicitarVinculo', () => {
    it('deve criar solicitação e retornar mensagem de sucesso', async () => {
      const dto = { alunoId: 1, empresaId: 1 };
      const solicitacao = { id: 1, ...dto, status: StatusSolicitacao.PENDENTE };

      mockVinculosService.solicitarVinculo.mockResolvedValue(solicitacao);

      const result = await controller.solicitarVinculo(dto);

      expect(result).toEqual({
        message: 'Solicitação de vínculo enviada com sucesso!',
        data: solicitacao,
      });
      expect(service.solicitarVinculo).toHaveBeenCalledWith(dto);
    });
  });

  describe('listarSolicitacoes', () => {
    it('deve listar solicitações com filtros', async () => {
      const filterDto = { empresaId: 1, status: StatusSolicitacao.PENDENTE };
      const solicitacoes = [{ id: 1, empresaId: 1 }];

      mockVinculosService.listarSolicitacoes.mockResolvedValue(solicitacoes);

      const result = await controller.listarSolicitacoes(filterDto);

      expect(result).toEqual({
        message: 'Solicitações encontradas',
        data: solicitacoes,
      });
      expect(service.listarSolicitacoes).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('listarSolicitacoesEmpresa', () => {
    it('deve listar solicitações de uma empresa', async () => {
      const solicitacoes = [{ id: 1, empresaId: 1 }];
      mockVinculosService.listarSolicitacoesEmpresa.mockResolvedValue(
        solicitacoes,
      );

      const result = await controller.listarSolicitacoesEmpresa(1);

      expect(result).toEqual({
        message: 'Solicitações da empresa encontradas',
        data: solicitacoes,
      });
      expect(service.listarSolicitacoesEmpresa).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });

    it('deve listar solicitações pendentes de uma empresa', async () => {
      const solicitacoes = [
        { id: 1, empresaId: 1, status: StatusSolicitacao.PENDENTE },
      ];
      mockVinculosService.listarSolicitacoesEmpresa.mockResolvedValue(
        solicitacoes,
      );

      const result = await controller.listarSolicitacoesEmpresa(
        1,
        StatusSolicitacao.PENDENTE,
      );

      expect(result.data).toEqual(solicitacoes);
      expect(service.listarSolicitacoesEmpresa).toHaveBeenCalledWith(
        1,
        StatusSolicitacao.PENDENTE,
      );
    });
  });

  describe('listarSolicitacoesAluno', () => {
    it('deve listar solicitações de um aluno', async () => {
      const solicitacoes = [{ id: 1, alunoId: 1 }];
      mockVinculosService.listarSolicitacoesAluno.mockResolvedValue(
        solicitacoes,
      );

      const result = await controller.listarSolicitacoesAluno(1);

      expect(result).toEqual({
        message: 'Solicitações do aluno encontradas',
        data: solicitacoes,
      });
      expect(service.listarSolicitacoesAluno).toHaveBeenCalledWith(
        1,
        undefined,
      );
    });
  });

  describe('aprovarSolicitacao', () => {
    it('deve aprovar solicitação e retornar mensagem de sucesso', async () => {
      const vinculo = { id: 1, empresaId: 1, alunoId: 1 };
      mockVinculosService.aprovarSolicitacao.mockResolvedValue(vinculo);

      const result = await controller.aprovarSolicitacao(1);

      expect(result).toEqual({
        message: 'Solicitação aprovada e vínculo criado com sucesso!',
        data: vinculo,
      });
      expect(service.aprovarSolicitacao).toHaveBeenCalledWith(1);
    });
  });

  describe('rejeitarSolicitacao', () => {
    it('deve rejeitar solicitação e retornar mensagem de sucesso', async () => {
      const dto = { motivoRejeicao: 'Não atende requisitos' };
      mockVinculosService.rejeitarSolicitacao.mockResolvedValue(undefined);

      const result = await controller.rejeitarSolicitacao(1, dto);

      expect(result).toEqual({
        message: 'Solicitação rejeitada com sucesso!',
      });
      expect(service.rejeitarSolicitacao).toHaveBeenCalledWith(1, dto);
    });

    it('deve rejeitar solicitação sem motivo', async () => {
      mockVinculosService.rejeitarSolicitacao.mockResolvedValue(undefined);

      const result = await controller.rejeitarSolicitacao(1, {});

      expect(result.message).toBe('Solicitação rejeitada com sucesso!');
      expect(service.rejeitarSolicitacao).toHaveBeenCalledWith(1, {});
    });
  });
});
