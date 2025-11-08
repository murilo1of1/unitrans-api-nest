import { Test, TestingModule } from '@nestjs/testing';
import { AlunosController } from './alunos.controller';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dtos/create-aluno.dto';
import { UpdateAlunoDto } from './dtos/update-aluno.dto';
import { SalvarEscolhasPontosDto } from './dtos/salvar-escolhas-pontos.dto';

describe('AlunosController', () => {
  let controller: AlunosController;
  let service: AlunosService;

  const mockAlunosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    salvarEscolhasPontos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlunosController],
      providers: [
        {
          provide: AlunosService,
          useValue: mockAlunosService,
        },
      ],
    }).compile();

    controller = module.get<AlunosController>(AlunosController);
    service = module.get<AlunosService>(AlunosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('deve retornar lista de alunos', async () => {
      const mockAlunos = [
        { id: 1, nome: 'João', email: 'joao@test.com' },
        { id: 2, nome: 'Maria', email: 'maria@test.com' },
      ];

      mockAlunosService.findAll.mockResolvedValue(mockAlunos);

      const result = await controller.getAll();

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockAlunos,
      });
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('deve retornar um aluno por ID', async () => {
      const mockAluno = { id: 1, nome: 'João', email: 'joao@test.com' };

      mockAlunosService.findOne.mockResolvedValue(mockAluno);

      const result = await controller.getOne('1');

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockAluno,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('deve criar um novo aluno', async () => {
      const createDto: CreateAlunoDto = {
        nome: 'João',
        email: 'joao@test.com',
        senha: 'senha123',
      };

      const mockAluno = { id: 1, ...createDto };

      mockAlunosService.create.mockResolvedValue(mockAluno);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        message: 'Criado com sucesso!',
        data: mockAluno,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('deve atualizar um aluno', async () => {
      const updateDto: UpdateAlunoDto = {
        nome: 'João Silva',
      };

      const mockAluno = { id: 1, nome: 'João Silva', email: 'joao@test.com' };

      mockAlunosService.update.mockResolvedValue(mockAluno);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        message: 'Atualizado com sucesso!',
        data: mockAluno,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('deve deletar um aluno', async () => {
      const mockAluno = { id: 1, nome: 'João', email: 'joao@test.com' };

      mockAlunosService.delete.mockResolvedValue(mockAluno);

      const result = await controller.delete('1');

      expect(result).toEqual({
        message: 'Registro excluído',
        data: mockAluno,
      });
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('salvarEscolhasPontos', () => {
    it('deve salvar escolhas de pontos', async () => {
      const dto: SalvarEscolhasPontosDto = {
        idAluno: 1,
        idRota: 1,
        pontoEmbarque: 5,
        pontoDesembarque: 10,
      };

      const mockResponse = {
        message: 'Escolhas salvas com sucesso',
        data: {
          aluno: {
            id: 1,
            nome: 'João',
            pontoEmbarque: 'Ponto A',
            pontoDesembarque: 'Ponto B',
          },
        },
      };

      mockAlunosService.salvarEscolhasPontos.mockResolvedValue(mockResponse);

      const result = await controller.salvarEscolhasPontos(dto);

      expect(result).toEqual(mockResponse);
      expect(service.salvarEscolhasPontos).toHaveBeenCalledWith(dto);
    });
  });
});
