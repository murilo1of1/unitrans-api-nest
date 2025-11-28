import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VinculosService } from './vinculos.service';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import {
  SolicitacaoVinculo,
  StatusSolicitacao,
} from './entities/solicitacao-vinculo.entity';
import { TokenAcesso } from './entities/token-acesso.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Aluno } from '../alunos/entities/aluno.entity';

describe('VinculosService', () => {
  let service: VinculosService;
  let empresaAlunoRepository: Repository<EmpresaAluno>;
  let solicitacaoVinculoRepository: Repository<SolicitacaoVinculo>;
  let tokenAcessoRepository: Repository<TokenAcesso>;
  let empresaRepository: Repository<Empresa>;
  let alunoRepository: Repository<Aluno>;

  const mockEmpresaAlunoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockSolicitacaoVinculoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockTokenAcessoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockEmpresaRepository = {
    findOne: jest.fn(),
  };

  const mockAlunoRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VinculosService,
        {
          provide: getRepositoryToken(EmpresaAluno),
          useValue: mockEmpresaAlunoRepository,
        },
        {
          provide: getRepositoryToken(SolicitacaoVinculo),
          useValue: mockSolicitacaoVinculoRepository,
        },
        {
          provide: getRepositoryToken(TokenAcesso),
          useValue: mockTokenAcessoRepository,
        },
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(Aluno),
          useValue: mockAlunoRepository,
        },
      ],
    }).compile();

    service = module.get<VinculosService>(VinculosService);
    empresaAlunoRepository = module.get(getRepositoryToken(EmpresaAluno));
    solicitacaoVinculoRepository = module.get(
      getRepositoryToken(SolicitacaoVinculo),
    );
    tokenAcessoRepository = module.get(getRepositoryToken(TokenAcesso));
    empresaRepository = module.get(getRepositoryToken(Empresa));
    alunoRepository = module.get(getRepositoryToken(Aluno));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('criarVinculo', () => {
    it('deve criar um vínculo com sucesso', async () => {
      const dto = {
        empresaId: 1,
        alunoId: 1,
        origemVinculo: 'manual' as const,
        vinculadoPor: 'Admin',
      };

      const aluno = { id: 1, nome: 'Aluno Teste' };
      const empresa = { id: 1, nomeFantasia: 'Empresa Teste' };
      const vinculoCriado = { id: 1, ...dto };
      const vinculoComRelacoes = { ...vinculoCriado, empresa, aluno };

      mockAlunoRepository.findOne.mockResolvedValue(aluno);
      mockEmpresaRepository.findOne.mockResolvedValue(empresa);
      mockEmpresaAlunoRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(vinculoComRelacoes);
      mockEmpresaAlunoRepository.create.mockReturnValue(vinculoCriado);
      mockEmpresaAlunoRepository.save.mockResolvedValue(vinculoCriado);

      const result = await service.criarVinculo(dto);

      expect(result).toEqual(vinculoComRelacoes);
      expect(mockAlunoRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.alunoId },
      });
      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.empresaId },
      });
      expect(mockEmpresaAlunoRepository.create).toHaveBeenCalledWith(dto);
      expect(mockEmpresaAlunoRepository.save).toHaveBeenCalledWith(
        vinculoCriado,
      );
    });

    it('deve lançar NotFoundException se aluno não existe', async () => {
      const dto = {
        empresaId: 1,
        alunoId: 999,
        origemVinculo: 'manual' as const,
        vinculadoPor: 'Admin',
      };
      mockAlunoRepository.findOne.mockResolvedValue(null);

      await expect(service.criarVinculo(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException se empresa não existe', async () => {
      const dto = {
        empresaId: 999,
        alunoId: 1,
        origemVinculo: 'manual' as const,
        vinculadoPor: 'Admin',
      };
      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.criarVinculo(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se vínculo já existe', async () => {
      const dto = {
        empresaId: 1,
        alunoId: 1,
        origemVinculo: 'manual' as const,
        vinculadoPor: 'Admin',
      };
      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaAlunoRepository.findOne.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      await expect(service.criarVinculo(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('listarVinculos', () => {
    it('deve listar vínculos com filtros', async () => {
      const vinculos = [{ id: 1, empresaId: 1, alunoId: 1 }];
      mockEmpresaAlunoRepository.find.mockResolvedValue(vinculos);

      const result = await service.listarVinculos({ empresaId: 1, alunoId: 1 });

      expect(result).toEqual(vinculos);
      expect(mockEmpresaAlunoRepository.find).toHaveBeenCalled();
    });
  });

  describe('desativarVinculo', () => {
    it('deve desativar vínculo com sucesso', async () => {
      const vinculo = { id: 1, ativo: true, dataDesvinculo: null };
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(vinculo);
      mockEmpresaAlunoRepository.save.mockResolvedValue({
        ...vinculo,
        ativo: false,
      });

      await service.desativarVinculo(1);

      expect(mockEmpresaAlunoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(vinculo.ativo).toBe(false);
      expect(vinculo.dataDesvinculo).toBeInstanceOf(Date);
    });

    it('deve lançar NotFoundException se vínculo não existe', async () => {
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(null);

      await expect(service.desativarVinculo(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('reativarVinculo', () => {
    it('deve reativar vínculo com sucesso', async () => {
      const vinculo = { id: 1, ativo: false, dataDesvinculo: new Date() };
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(vinculo);
      mockEmpresaAlunoRepository.save.mockResolvedValue({
        ...vinculo,
        ativo: true,
        dataDesvinculo: null,
      });

      await service.reativarVinculo(1);

      expect(vinculo.ativo).toBe(true);
      expect(vinculo.dataDesvinculo).toBeNull();
    });
  });

  describe('gerarToken', () => {
    it('deve gerar token com sucesso', async () => {
      const dto = { empresaId: 1 };
      const empresa = { id: 1, nomeFantasia: 'Empresa Teste' };
      const tokenSalvo = { id: 1, token: 'hashed' };

      mockEmpresaRepository.findOne.mockResolvedValue(empresa);
      mockTokenAcessoRepository.create.mockReturnValue(tokenSalvo);
      mockTokenAcessoRepository.save.mockResolvedValue(tokenSalvo);

      const result = await service.gerarToken(dto);

      expect(result).toHaveProperty('token');
      expect(result.token).toHaveLength(8);
      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.empresaId },
      });
      expect(mockTokenAcessoRepository.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se empresa não existe', async () => {
      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.gerarToken({ empresaId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revogarToken', () => {
    it('deve revogar token com sucesso', async () => {
      const token = { id: 1, ativo: true };
      mockTokenAcessoRepository.findOne.mockResolvedValue(token);
      mockTokenAcessoRepository.save.mockResolvedValue({
        ...token,
        ativo: false,
      });

      await service.revogarToken(1);

      expect(token.ativo).toBe(false);
    });

    it('deve lançar NotFoundException se token não existe', async () => {
      mockTokenAcessoRepository.findOne.mockResolvedValue(null);

      await expect(service.revogarToken(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('vincularPorToken', () => {
    it('deve vincular aluno usando token válido', async () => {
      const dto = { token: 'ABC12345', alunoId: 1 };
      const tokenAcesso = {
        id: 1,
        token: await bcrypt.hash('ABC12345', 10),
        ativo: true,
        dataExpiracao: new Date(Date.now() + 60000),
        usoUnico: false,
        usado: false,
        idEmpresa: 1,
      };
      const aluno = { id: 1 };
      const empresa = { id: 1 };
      const vinculoCriado = { id: 1, empresaId: 1, alunoId: 1 };
      const vinculoComRelacoes = { ...vinculoCriado, empresa, aluno };

      mockAlunoRepository.findOne.mockResolvedValue(aluno);
      mockEmpresaRepository.findOne.mockResolvedValue(empresa);
      mockTokenAcessoRepository.find.mockResolvedValue([tokenAcesso]);
      mockEmpresaAlunoRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(vinculoComRelacoes);
      mockEmpresaAlunoRepository.create.mockReturnValue(vinculoCriado);
      mockEmpresaAlunoRepository.save.mockResolvedValue(vinculoCriado);
      mockTokenAcessoRepository.save.mockResolvedValue(tokenAcesso);

      const result = await service.vincularPorToken(dto);

      expect(result).toEqual(vinculoComRelacoes);
      expect(tokenAcesso.usado).toBe(true);
    });

    it('deve lançar BadRequestException se token inválido', async () => {
      const dto = { token: 'INVALID', alunoId: 1 };
      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockTokenAcessoRepository.find.mockResolvedValue([]);

      await expect(service.vincularPorToken(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se token expirado', async () => {
      const dto = { token: 'ABC12345', alunoId: 1 };
      const tokenAcesso = {
        id: 1,
        token: await bcrypt.hash('ABC12345', 10),
        ativo: true,
        dataExpiracao: new Date(Date.now() - 60000), // Expirado
        usoUnico: false,
        usado: false,
      };

      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockTokenAcessoRepository.find.mockResolvedValue([tokenAcesso]);

      await expect(service.vincularPorToken(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se token já foi usado (uso único)', async () => {
      const dto = { token: 'ABC12345', alunoId: 1 };
      const tokenAcesso = {
        id: 1,
        token: await bcrypt.hash('ABC12345', 10),
        ativo: true,
        dataExpiracao: new Date(Date.now() + 60000),
        usoUnico: true,
        usado: true, // Já usado
      };

      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockTokenAcessoRepository.find.mockResolvedValue([tokenAcesso]);

      await expect(service.vincularPorToken(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('solicitarVinculo', () => {
    it('deve criar solicitação com sucesso', async () => {
      const dto = { alunoId: 1, empresaId: 1 };
      const aluno = { id: 1 };
      const empresa = { id: 1 };
      const solicitacaoCriada = {
        id: 1,
        ...dto,
        status: StatusSolicitacao.PENDENTE,
      };
      const solicitacaoComRelacoes = { ...solicitacaoCriada, aluno, empresa };

      mockAlunoRepository.findOne.mockResolvedValue(aluno);
      mockEmpresaRepository.findOne.mockResolvedValue(empresa);
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(null);
      mockSolicitacaoVinculoRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(solicitacaoComRelacoes);
      mockSolicitacaoVinculoRepository.create.mockReturnValue(
        solicitacaoCriada,
      );
      mockSolicitacaoVinculoRepository.save.mockResolvedValue(
        solicitacaoCriada,
      );

      const result = await service.solicitarVinculo(dto);

      expect(result).toEqual(solicitacaoComRelacoes);
    });

    it('deve lançar BadRequestException se vínculo já existe', async () => {
      const dto = { alunoId: 1, empresaId: 1 };
      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaAlunoRepository.findOne.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      await expect(service.solicitarVinculo(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se solicitação pendente já existe', async () => {
      const dto = { alunoId: 1, empresaId: 1 };
      mockAlunoRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaRepository.findOne.mockResolvedValue({ id: 1 });
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(null);
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue({
        id: 1,
        status: StatusSolicitacao.PENDENTE,
      });

      await expect(service.solicitarVinculo(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('aprovarSolicitacao', () => {
    it('deve aprovar solicitação e criar vínculo', async () => {
      const solicitacao = {
        id: 1,
        idEmpresa: 1,
        idAluno: 1,
        status: StatusSolicitacao.PENDENTE,
        respondidoEm: null as any,
      };
      const vinculoCriado = { id: 1, empresaId: 1, alunoId: 1 };
      const vinculoComRelacoes = { ...vinculoCriado, empresa: {}, aluno: {} };

      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);
      mockEmpresaAlunoRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(vinculoComRelacoes);
      mockEmpresaAlunoRepository.create.mockReturnValue(vinculoCriado);
      mockEmpresaAlunoRepository.save.mockResolvedValue(vinculoCriado);
      mockSolicitacaoVinculoRepository.save.mockResolvedValue(solicitacao);

      const result = await service.aprovarSolicitacao(1);

      expect(result).toEqual(vinculoComRelacoes);
      expect(solicitacao.status).toBe(StatusSolicitacao.APROVADO);
      expect(solicitacao.respondidoEm).toBeInstanceOf(Date);
    });

    it('deve lançar NotFoundException se solicitação não existe', async () => {
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(null);

      await expect(service.aprovarSolicitacao(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se solicitação não está pendente', async () => {
      const solicitacao = { id: 1, status: StatusSolicitacao.APROVADO };
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);

      await expect(service.aprovarSolicitacao(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se vínculo já existe', async () => {
      const solicitacao = {
        id: 1,
        idEmpresa: 1,
        idAluno: 1,
        status: StatusSolicitacao.PENDENTE,
      };
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);
      mockEmpresaAlunoRepository.findOne.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      await expect(service.aprovarSolicitacao(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('rejeitarSolicitacao', () => {
    it('deve rejeitar solicitação com motivo', async () => {
      const solicitacao = {
        id: 1,
        status: StatusSolicitacao.PENDENTE,
        motivoRejeicao: null,
        respondidoEm: null as any,
      };
      const dto = { motivoRejeicao: 'Não atende requisitos' };

      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);
      mockSolicitacaoVinculoRepository.save.mockResolvedValue(solicitacao);

      await service.rejeitarSolicitacao(1, dto);

      expect(solicitacao.status).toBe(StatusSolicitacao.REJEITADO);
      expect(solicitacao.respondidoEm).toBeInstanceOf(Date);
      expect(solicitacao.motivoRejeicao).toBe(dto.motivoRejeicao);
    });

    it('deve rejeitar solicitação sem motivo', async () => {
      const solicitacao = {
        id: 1,
        status: StatusSolicitacao.PENDENTE,
        motivoRejeicao: null,
        respondidoEm: null as any,
      };

      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);
      mockSolicitacaoVinculoRepository.save.mockResolvedValue(solicitacao);

      await service.rejeitarSolicitacao(1, {});

      expect(solicitacao.status).toBe(StatusSolicitacao.REJEITADO);
      expect(solicitacao.motivoRejeicao).toBeNull();
    });

    it('deve lançar NotFoundException se solicitação não existe', async () => {
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(null);

      await expect(service.rejeitarSolicitacao(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException se solicitação não está pendente', async () => {
      const solicitacao = { id: 1, status: StatusSolicitacao.REJEITADO };
      mockSolicitacaoVinculoRepository.findOne.mockResolvedValue(solicitacao);

      await expect(service.rejeitarSolicitacao(1, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
