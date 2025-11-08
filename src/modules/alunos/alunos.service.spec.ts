import { Test, TestingModule } from '@nestjs/testing';
import { AlunosService } from './alunos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from './entities/aluno.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Rota } from '../rotas/entities/rota.entity';
import { RotaPassageiro } from '../rotas/entities/rota-passageiro.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AlunosService', () => {
  let service: AlunosService;
  let alunosRepository: Repository<Aluno>;
  let pontosRepository: Repository<Ponto>;
  let rotasRepository: Repository<Rota>;
  let rotaPassageiroRepository: Repository<RotaPassageiro>;
  let empresaAlunoRepository: Repository<EmpresaAluno>;

  const mockAlunosRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPontosRepository = {
    findOne: jest.fn(),
  };

  const mockRotasRepository = {
    findOne: jest.fn(),
  };

  const mockRotaPassageiroRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockEmpresaAlunoRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlunosService,
        {
          provide: getRepositoryToken(Aluno),
          useValue: mockAlunosRepository,
        },
        {
          provide: getRepositoryToken(Ponto),
          useValue: mockPontosRepository,
        },
        {
          provide: getRepositoryToken(Rota),
          useValue: mockRotasRepository,
        },
        {
          provide: getRepositoryToken(RotaPassageiro),
          useValue: mockRotaPassageiroRepository,
        },
        {
          provide: getRepositoryToken(EmpresaAluno),
          useValue: mockEmpresaAlunoRepository,
        },
      ],
    }).compile();

    service = module.get<AlunosService>(AlunosService);
    alunosRepository = module.get<Repository<Aluno>>(getRepositoryToken(Aluno));
    pontosRepository = module.get<Repository<Ponto>>(getRepositoryToken(Ponto));
    rotasRepository = module.get<Repository<Rota>>(getRepositoryToken(Rota));
    rotaPassageiroRepository = module.get<Repository<RotaPassageiro>>(
      getRepositoryToken(RotaPassageiro),
    );
    empresaAlunoRepository = module.get<Repository<EmpresaAluno>>(
      getRepositoryToken(EmpresaAluno),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os alunos', async () => {
      const mockAlunos = [
        { id: 1, nome: 'João', email: 'joao@test.com' },
        { id: 2, nome: 'Maria', email: 'maria@test.com' },
      ];

      mockAlunosRepository.find.mockResolvedValue(mockAlunos);

      const result = await service.findAll();

      expect(result).toEqual(mockAlunos);
      expect(mockAlunosRepository.find).toHaveBeenCalledWith({
        order: { id: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um aluno por ID', async () => {
      const mockAluno = { id: 1, nome: 'João', email: 'joao@test.com' };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAluno);
      expect(mockAlunosRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando aluno não existe', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Aluno não encontrado',
      );
    });
  });

  describe('create', () => {
    it('deve criar um aluno com senha hasheada', async () => {
      const createDto = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
      };

      const mockAlunoCreated = { id: 1, ...createDto };
      const mockAlunoSaved = { id: 1, nome: 'João', email: 'joao@test.com' };

      mockAlunosRepository.create.mockReturnValue(mockAlunoCreated);
      mockAlunosRepository.save.mockResolvedValue({ id: 1 });
      mockAlunosRepository.findOne.mockResolvedValue(mockAlunoSaved);

      const result = await service.create(createDto as any);

      expect(result).toEqual(mockAlunoSaved);
      expect(mockAlunosRepository.create).toHaveBeenCalled();
    });

    it('deve criar aluno sem senha', async () => {
      const createDto = {
        nome: 'João',
        email: 'joao@test.com',
      };

      const mockAlunoSaved = { id: 1, ...createDto };

      mockAlunosRepository.create.mockReturnValue(mockAlunoSaved);
      mockAlunosRepository.save.mockResolvedValue({ id: 1 });
      mockAlunosRepository.findOne.mockResolvedValue(mockAlunoSaved);

      const result = await service.create(createDto as any);

      expect(result).toEqual(mockAlunoSaved);
    });
  });

  describe('update', () => {
    it('deve atualizar um aluno', async () => {
      const mockAluno = { id: 1, nome: 'João', email: 'joao@test.com' };
      const updateDto = { nome: 'João Silva' };
      const updatedAluno = { ...mockAluno, ...updateDto };

      mockAlunosRepository.findOne
        .mockResolvedValueOnce(mockAluno)
        .mockResolvedValueOnce(updatedAluno);
      mockAlunosRepository.update.mockResolvedValue(undefined);

      const result = await service.update(1, updateDto as any);

      expect(result).toEqual(updatedAluno);
      expect(mockAlunosRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('deve lançar NotFoundException quando aluno não existe', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve atualizar senha com hash', async () => {
      const mockAluno = { id: 1, nome: 'João', email: 'joao@test.com' };
      const updateDto = { senha: 'novaSenha123' };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockAlunosRepository.update.mockResolvedValue(undefined);

      await service.update(1, updateDto as any);

      expect(mockAlunosRepository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve deletar um aluno', async () => {
      const mockAluno = {
        id: 1,
        nome: 'João',
        email: 'joao@test.com',
        cpf: '12345678900',
      };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockAlunosRepository.remove.mockResolvedValue(mockAluno);

      const result = await service.delete(1);

      expect(result).toEqual({
        id: 1,
        nome: 'João',
        email: 'joao@test.com',
        cpf: '12345678900',
      });
      expect(mockAlunosRepository.remove).toHaveBeenCalledWith(mockAluno);
    });

    it('deve lançar NotFoundException quando aluno não existe', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('salvarEscolhasPontos', () => {
    const mockDto = {
      idAluno: 1,
      idRota: 1,
      pontoEmbarque: 5,
      pontoDesembarque: 10,
    };

    it('deve salvar escolhas de pontos com sucesso', async () => {
      const mockAluno = { id: 1, nome: 'João' };
      const mockRota = { id: 1, idEmpresa: 1 };
      const mockVinculo = { id: 1, alunoId: 1, empresaId: 1, ativo: true };
      const mockPontoEmb = { id: 5, nome: 'Ponto A' };
      const mockPontoDes = { id: 10, nome: 'Ponto B' };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockRotasRepository.findOne.mockResolvedValue(mockRota);
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(mockVinculo);
      mockPontosRepository.findOne
        .mockResolvedValueOnce(mockPontoEmb)
        .mockResolvedValueOnce(mockPontoDes);
      mockAlunosRepository.update.mockResolvedValue(undefined);
      mockRotaPassageiroRepository.findOne.mockResolvedValue(null);
      mockRotaPassageiroRepository.create.mockReturnValue({});
      mockRotaPassageiroRepository.save.mockResolvedValue({});

      const result = await service.salvarEscolhasPontos(mockDto);

      expect(result.message).toBe('Escolhas salvas com sucesso');
      expect(result.data.aluno.pontoEmbarque).toBe('Ponto A');
      expect(result.data.aluno.pontoDesembarque).toBe('Ponto B');
    });

    it('deve lançar NotFoundException quando aluno não existe', async () => {
      mockAlunosRepository.findOne.mockResolvedValue(null);

      await expect(service.salvarEscolhasPontos(mockDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      mockAlunosRepository.findOne.mockResolvedValue({ id: 1 });
      mockRotasRepository.findOne.mockResolvedValue(null);

      await expect(service.salvarEscolhasPontos(mockDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ForbiddenException quando aluno não está vinculado', async () => {
      mockAlunosRepository.findOne.mockResolvedValue({ id: 1 });
      mockRotasRepository.findOne.mockResolvedValue({ id: 1, idEmpresa: 1 });
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(null);

      await expect(service.salvarEscolhasPontos(mockDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar NotFoundException quando pontos não existem', async () => {
      const mockAluno = { id: 1 };
      const mockRota = { id: 1, idEmpresa: 1 };
      const mockVinculo = { id: 1, ativo: true };

      mockAlunosRepository.findOne.mockResolvedValue(mockAluno);
      mockRotasRepository.findOne.mockResolvedValue(mockRota);
      mockEmpresaAlunoRepository.findOne.mockResolvedValue(mockVinculo);
      mockPontosRepository.findOne.mockResolvedValue(null);

      await expect(service.salvarEscolhasPontos(mockDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
