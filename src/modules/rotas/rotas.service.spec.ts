import { Test, TestingModule } from '@nestjs/testing';
import { RotasService } from './rotas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rota } from './entities/rota.entity';
import { RotaPonto } from './entities/rota-ponto.entity';
import { RotaPassageiro } from './entities/rota-passageiro.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Aluno } from '../alunos/entities/aluno.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RotasService', () => {
  let service: RotasService;
  let rotaRepository: Repository<Rota>;
  let rotaPontoRepository: Repository<RotaPonto>;
  let rotaPassageiroRepository: Repository<RotaPassageiro>;
  let empresaRepository: Repository<Empresa>;
  let pontoRepository: Repository<Ponto>;
  let alunoRepository: Repository<Aluno>;
  let empresaAlunoRepository: Repository<EmpresaAluno>;

  const mockRotaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockRotaPontoRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockRotaPassageiroRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEmpresaRepository = {
    findOne: jest.fn(),
  };

  const mockPontoRepository = {
    findOne: jest.fn(),
  };

  const mockAlunoRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockEmpresaAlunoRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RotasService,
        {
          provide: getRepositoryToken(Rota),
          useValue: mockRotaRepository,
        },
        {
          provide: getRepositoryToken(RotaPonto),
          useValue: mockRotaPontoRepository,
        },
        {
          provide: getRepositoryToken(RotaPassageiro),
          useValue: mockRotaPassageiroRepository,
        },
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(Ponto),
          useValue: mockPontoRepository,
        },
        {
          provide: getRepositoryToken(Aluno),
          useValue: mockAlunoRepository,
        },
        {
          provide: getRepositoryToken(EmpresaAluno),
          useValue: mockEmpresaAlunoRepository,
        },
      ],
    }).compile();

    service = module.get<RotasService>(RotasService);
    rotaRepository = module.get<Repository<Rota>>(getRepositoryToken(Rota));
    rotaPontoRepository = module.get<Repository<RotaPonto>>(
      getRepositoryToken(RotaPonto),
    );
    rotaPassageiroRepository = module.get<Repository<RotaPassageiro>>(
      getRepositoryToken(RotaPassageiro),
    );
    empresaRepository = module.get<Repository<Empresa>>(
      getRepositoryToken(Empresa),
    );
    pontoRepository = module.get<Repository<Ponto>>(getRepositoryToken(Ponto));
    alunoRepository = module.get<Repository<Aluno>>(getRepositoryToken(Aluno));
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
    it('deve retornar todas as rotas com empresa', async () => {
      const mockRotas = [
        {
          id: 1,
          nome: 'Rota Centro-Bairro',
          origem: 'Centro',
          destino: 'Bairro Norte',
          idEmpresa: 1,
          empresa: { id: 1, nome: 'Empresa Teste' },
        },
        {
          id: 2,
          nome: 'Rota Campus-Centro',
          origem: 'Campus',
          destino: 'Centro',
          idEmpresa: 1,
          empresa: { id: 1, nome: 'Empresa Teste' },
        },
      ];

      mockRotaRepository.find.mockResolvedValue(mockRotas);

      const result = await service.findAll();

      expect(result).toEqual(mockRotas);
      expect(mockRotaRepository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
        order: { id: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma rota por ID', async () => {
      const mockRota = {
        id: 1,
        nome: 'Rota Centro-Bairro',
        origem: 'Centro',
        destino: 'Bairro Norte',
        idEmpresa: 1,
        empresa: { id: 1, nome: 'Empresa Teste' },
      };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRota);
      expect(mockRotaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['empresa'],
      });
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Rota não encontrada');
    });
  });

  describe('findByEmpresa', () => {
    it('deve retornar rotas da empresa com pontos', async () => {
      const mockRotas = [
        {
          id: 1,
          nome: 'Rota Centro-Bairro',
          origem: 'Centro',
          destino: 'Bairro Norte',
          idEmpresa: 1,
        },
      ];

      const mockPontos = [
        {
          id: 1,
          idRota: 1,
          idPonto: 1,
          ordem: 1,
          tipo: 'embarque',
          ativo: true,
          ponto: {
            id: 1,
            nome: 'Terminal Central',
            endereco: 'Av. Principal, 100',
            latitude: -23.5505,
            longitude: -46.6333,
          },
        },
      ];

      mockRotaRepository.find.mockResolvedValue(mockRotas);
      mockRotaPontoRepository.find.mockResolvedValue(mockPontos);

      const result = await service.findByEmpresa(1);

      expect(result).toHaveLength(1);
      expect(result[0].pontos).toHaveLength(1);
      expect(result[0].pontos[0].ponto.nome).toBe('Terminal Central');
      expect(mockRotaRepository.find).toHaveBeenCalledWith({
        where: { idEmpresa: 1 },
        order: { id: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('deve criar uma nova rota', async () => {
      const createRotaDto = {
        nome: 'Rota Nova',
        origem: 'Ponto A',
        destino: 'Ponto B',
        idEmpresa: 1,
      };

      const mockEmpresa = { id: 1, nome: 'Empresa Teste' };
      const mockRota = { id: 1, ...createRotaDto };

      mockEmpresaRepository.findOne.mockResolvedValue(mockEmpresa);
      mockRotaRepository.create.mockReturnValue(mockRota);
      mockRotaRepository.save.mockResolvedValue(mockRota);

      const result = await service.create(createRotaDto);

      expect(result).toEqual(mockRota);
      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRotaRepository.create).toHaveBeenCalledWith(createRotaDto);
      expect(mockRotaRepository.save).toHaveBeenCalledWith(mockRota);
    });

    it('deve lançar NotFoundException quando empresa não existe', async () => {
      const createRotaDto = {
        nome: 'Rota Nova',
        origem: 'Ponto A',
        destino: 'Ponto B',
        idEmpresa: 999,
      };

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createRotaDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createRotaDto)).rejects.toThrow(
        'Empresa não encontrada',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar uma rota', async () => {
      const mockRota = {
        id: 1,
        nome: 'Rota Antiga',
        origem: 'Centro',
        destino: 'Bairro',
        idEmpresa: 1,
      };

      const updateRotaDto = {
        nome: 'Rota Atualizada',
      };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockRotaRepository.save.mockResolvedValue({
        ...mockRota,
        ...updateRotaDto,
      });

      const result = await service.update(1, updateRotaDto);

      expect(result.nome).toBe('Rota Atualizada');
      expect(mockRotaRepository.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { nome: 'Teste' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deve deletar uma rota', async () => {
      const mockRota = {
        id: 1,
        nome: 'Rota Teste',
        origem: 'Centro',
        destino: 'Bairro',
        idEmpresa: 1,
      };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockRotaRepository.remove.mockResolvedValue(mockRota);

      await service.delete(1);

      expect(mockRotaRepository.remove).toHaveBeenCalledWith(mockRota);
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPontosRota', () => {
    it('deve retornar pontos da rota ordenados', async () => {
      const mockRota = { id: 1, nome: 'Rota Teste' };
      const mockPontos = [
        {
          id: 1,
          ordem: 1,
          tipo: 'embarque',
          ativo: true,
          ponto: {
            id: 1,
            nome: 'Ponto A',
            endereco: 'Rua A',
            latitude: -23.55,
            longitude: -46.63,
          },
        },
      ];

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockRotaPontoRepository.find.mockResolvedValue(mockPontos);

      const result = await service.getPontosRota(1);

      expect(result).toHaveLength(1);
      expect(result[0].ponto.nome).toBe('Ponto A');
      expect(mockRotaPontoRepository.find).toHaveBeenCalledWith({
        where: { idRota: 1 },
        relations: ['ponto'],
        order: { ordem: 'ASC' },
      });
    });
  });

  describe('addPontoToRota', () => {
    it('deve adicionar ponto à rota', async () => {
      const addPontoDto = {
        idPonto: 1,
        tipo: 'embarque' as const,
        ordem: 1,
      };

      const mockRota = { id: 1, nome: 'Rota Teste' };
      const mockPonto = { id: 1, nome: 'Ponto Teste' };
      const mockRotaPonto = { id: 1, idRota: 1, ...addPontoDto, ativo: true };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockRotaPontoRepository.findOne.mockResolvedValue(null);
      mockRotaPontoRepository.create.mockReturnValue(mockRotaPonto);
      mockRotaPontoRepository.save.mockResolvedValue(mockRotaPonto);

      const result = await service.addPontoToRota(1, addPontoDto);

      expect(result).toEqual(mockRotaPonto);
      expect(mockRotaPontoRepository.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      const addPontoDto = {
        idPonto: 1,
        tipo: 'embarque' as const,
        ordem: 1,
      };

      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.addPontoToRota(999, addPontoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar NotFoundException quando ponto não existe', async () => {
      const addPontoDto = {
        idPonto: 999,
        tipo: 'embarque' as const,
        ordem: 1,
      };

      mockRotaRepository.findOne.mockResolvedValue({ id: 1 });
      mockPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.addPontoToRota(1, addPontoDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar BadRequestException quando ponto já existe na rota', async () => {
      const addPontoDto = {
        idPonto: 1,
        tipo: 'embarque' as const,
        ordem: 1,
      };

      mockRotaRepository.findOne.mockResolvedValue({ id: 1 });
      mockPontoRepository.findOne.mockResolvedValue({ id: 1 });
      mockRotaPontoRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.addPontoToRota(1, addPontoDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addPontoToRota(1, addPontoDto)).rejects.toThrow(
        'Este ponto já está cadastrado como embarque nesta rota',
      );
    });
  });

  describe('removePontoFromRota', () => {
    it('deve remover ponto da rota', async () => {
      const mockRotaPonto = { id: 1, idRota: 1, idPonto: 1 };

      mockRotaPontoRepository.findOne.mockResolvedValue(mockRotaPonto);
      mockRotaPontoRepository.remove.mockResolvedValue(mockRotaPonto);

      await service.removePontoFromRota(1);

      expect(mockRotaPontoRepository.remove).toHaveBeenCalledWith(
        mockRotaPonto,
      );
    });

    it('deve lançar NotFoundException quando associação não existe', async () => {
      mockRotaPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.removePontoFromRota(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updatePontoRota', () => {
    it('deve atualizar ponto na rota', async () => {
      const mockRotaPonto = {
        id: 1,
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque',
        ativo: true,
      };

      const updateDto = { ordem: 2, ativo: false };

      mockRotaPontoRepository.findOne.mockResolvedValue(mockRotaPonto);
      mockRotaPontoRepository.save.mockResolvedValue({
        ...mockRotaPonto,
        ...updateDto,
      });

      const result = await service.updatePontoRota(1, updateDto);

      expect(result.ordem).toBe(2);
      expect(result.ativo).toBe(false);
      expect(mockRotaPontoRepository.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando associação não existe', async () => {
      mockRotaPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePontoRota(999, { ordem: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPassageirosRota', () => {
    it('deve retornar passageiros agrupados por ponto', async () => {
      const getPassageirosDto = {
        idRota: 1,
        tipo: undefined,
      };

      const mockRota = { id: 1, nome: 'Rota Teste', idEmpresa: 1 };
      const mockPontos = [
        {
          id: 1,
          ordem: 1,
          tipo: 'embarque',
          ponto: { id: 1, nome: 'Ponto A', endereco: 'Rua A' },
        },
      ];
      const mockVinculos = [{ alunoId: 1 }];
      const mockAlunos = [
        {
          id: 1,
          nome: 'Aluno Teste',
          email: 'aluno@test.com',
          pontoEmbarque: 1,
          pontoDesembarque: 2,
          pontoEmbarqueObj: { id: 1, nome: 'Ponto A' },
          pontoDesembarqueObj: { id: 2, nome: 'Ponto B' },
        },
      ];

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockRotaPontoRepository.find.mockResolvedValue(mockPontos);
      mockEmpresaAlunoRepository.find.mockResolvedValue(mockVinculos);

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockAlunos),
      };
      mockAlunoRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRotaPassageiroRepository.findOne.mockResolvedValue(null);
      mockRotaPassageiroRepository.save.mockResolvedValue({});

      const result = await service.getPassageirosRota(getPassageirosDto);

      expect(result.rota.id).toBe(1);
      expect(result.pontosComPassageiros).toHaveLength(1);
      expect(result.totalPassageiros).toBe(1);
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.getPassageirosRota({ idRota: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve retornar vazio quando não há alunos vinculados', async () => {
      const mockRota = { id: 1, nome: 'Rota Teste', idEmpresa: 1 };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockEmpresaAlunoRepository.find.mockResolvedValue([]);

      const result = await service.getPassageirosRota({ idRota: 1 });

      expect(result.pontosComPassageiros).toHaveLength(0);
      expect(result.totalPassageiros).toBe(0);
    });
  });
});
