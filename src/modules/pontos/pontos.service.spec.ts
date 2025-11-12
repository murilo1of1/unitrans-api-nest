import { Test, TestingModule } from '@nestjs/testing';
import { PontosService } from './pontos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ponto } from './entities/ponto.entity';
import { RotaPonto } from '../rotas/entities/rota-ponto.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Rota } from '../rotas/entities/rota.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PontosService', () => {
  let service: PontosService;
  let pontoRepository: Repository<Ponto>;
  let rotaPontoRepository: Repository<RotaPonto>;
  let empresaRepository: Repository<Empresa>;
  let rotaRepository: Repository<Rota>;

  const mockPontoRepository = {
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

  const mockEmpresaRepository = {
    findOne: jest.fn(),
  };

  const mockRotaRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PontosService,
        {
          provide: getRepositoryToken(Ponto),
          useValue: mockPontoRepository,
        },
        {
          provide: getRepositoryToken(RotaPonto),
          useValue: mockRotaPontoRepository,
        },
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(Rota),
          useValue: mockRotaRepository,
        },
      ],
    }).compile();

    service = module.get<PontosService>(PontosService);
    pontoRepository = module.get<Repository<Ponto>>(getRepositoryToken(Ponto));
    rotaPontoRepository = module.get<Repository<RotaPonto>>(
      getRepositoryToken(RotaPonto),
    );
    empresaRepository = module.get<Repository<Empresa>>(
      getRepositoryToken(Empresa),
    );
    rotaRepository = module.get<Repository<Rota>>(getRepositoryToken(Rota));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar todos os pontos ordenados por nome', async () => {
      const mockPontos = [
        {
          id: 1,
          nome: 'Ponto A',
          endereco: 'Rua A, 123',
          latitude: -23.5505,
          longitude: -46.6333,
        },
        {
          id: 2,
          nome: 'Ponto B',
          endereco: 'Rua B, 456',
          latitude: -23.5506,
          longitude: -46.6334,
        },
      ];

      mockPontoRepository.find.mockResolvedValue(mockPontos);

      const result = await service.findAll();

      expect(result).toEqual(mockPontos);
      expect(mockPontoRepository.find).toHaveBeenCalledWith({
        relations: ['empresa'],
        order: { nome: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar um ponto por ID', async () => {
      const mockPonto = {
        id: 1,
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
      };

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPonto);
      expect(mockPontoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['empresa'],
      });
    });

    it('deve lançar NotFoundException quando ponto não existe', async () => {
      mockPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Ponto não encontrado',
      );
    });
  });

  describe('findByEmpresa', () => {
    it('deve retornar pontos de uma empresa específica', async () => {
      const mockPontos = [
        { id: 1, nome: 'Ponto A', idEmpresa: 1 },
        { id: 2, nome: 'Ponto B', idEmpresa: 1 },
      ];

      mockPontoRepository.find.mockResolvedValue(mockPontos);

      const result = await service.findByEmpresa(1);

      expect(result).toEqual(mockPontos);
      expect(mockPontoRepository.find).toHaveBeenCalledWith({
        where: { idEmpresa: 1 },
        order: { nome: 'ASC' },
      });
    });
  });

  describe('create', () => {
    it('deve criar um novo ponto', async () => {
      const createDto = {
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
        latitude: -23.5505,
        longitude: -46.6333,
        idEmpresa: 1,
      };

      const mockEmpresa = { id: 1, nome: 'Empresa Teste' };
      const mockPontoCreated = { id: 1, ...createDto };

      mockEmpresaRepository.findOne.mockResolvedValue(mockEmpresa);
      mockPontoRepository.create.mockReturnValue(createDto);
      mockPontoRepository.save.mockResolvedValue(mockPontoCreated);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPontoCreated);
      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPontoRepository.create).toHaveBeenCalledWith({
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
        latitude: -23.5505,
        longitude: -46.6333,
        idEmpresa: 1,
      });
    });

    it('deve lançar NotFoundException quando empresa não existe', async () => {
      const createDto = {
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
        latitude: -23.5505,
        longitude: -46.6333,
        idEmpresa: 999,
      };

      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Empresa não encontrada',
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um ponto', async () => {
      const mockPonto = {
        id: 1,
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
        idEmpresa: 1,
      };
      const updateDto = { nome: 'Ponto A Atualizado' };
      const updatedPonto = { ...mockPonto, ...updateDto };

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockPontoRepository.save.mockResolvedValue(updatedPonto);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedPonto);
      expect(mockPontoRepository.save).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando ponto não existe', async () => {
      mockPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('deve validar empresa ao atualizar idEmpresa', async () => {
      const mockPonto = { id: 1, nome: 'Ponto A', idEmpresa: 1 };
      const updateDto = { idEmpresa: 2 };
      const mockEmpresa = { id: 2, nome: 'Empresa 2' };

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockEmpresaRepository.findOne.mockResolvedValue(mockEmpresa);
      mockPontoRepository.save.mockResolvedValue({
        ...mockPonto,
        ...updateDto,
      });

      await service.update(1, updateDto);

      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
    });

    it('deve lançar NotFoundException quando nova empresa não existe', async () => {
      const mockPonto = { id: 1, nome: 'Ponto A', idEmpresa: 1 };
      const updateDto = { idEmpresa: 999 };

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deve deletar um ponto', async () => {
      const mockPonto = { id: 1, nome: 'Ponto A' };

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockRotaPontoRepository.find.mockResolvedValue([]);
      mockPontoRepository.remove.mockResolvedValue(mockPonto);

      await service.delete(1);

      expect(mockPontoRepository.remove).toHaveBeenCalledWith(mockPonto);
    });

    it('deve lançar NotFoundException quando ponto não existe', async () => {
      mockPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException quando ponto está vinculado a rotas', async () => {
      const mockPonto = { id: 1, nome: 'Ponto A' };
      const mockRotaPontos = [{ id: 1, idRota: 1, idPonto: 1 }];

      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockRotaPontoRepository.find.mockResolvedValue(mockRotaPontos);

      await expect(service.delete(1)).rejects.toThrow(BadRequestException);
      await expect(service.delete(1)).rejects.toThrow(
        'Não é possível excluir ponto vinculado a rotas',
      );
    });
  });

  describe('addPontoToRota', () => {
    it('deve adicionar um ponto a uma rota', async () => {
      const addDto = {
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque' as const,
        ativo: true,
      };

      const mockRota = { id: 1, nome: 'Rota A' };
      const mockPonto = { id: 1, nome: 'Ponto A' };
      const mockRotaPonto = { id: 1, ...addDto };

      mockRotaRepository.findOne.mockResolvedValue(mockRota);
      mockPontoRepository.findOne.mockResolvedValue(mockPonto);
      mockRotaPontoRepository.findOne.mockResolvedValue(null);
      mockRotaPontoRepository.create.mockReturnValue(addDto);
      mockRotaPontoRepository.save.mockResolvedValue(mockRotaPonto);

      const result = await service.addPontoToRota(addDto);

      expect(result).toEqual(mockRotaPonto);
      expect(mockRotaPontoRepository.create).toHaveBeenCalledWith(addDto);
    });

    it('deve lançar NotFoundException quando rota não existe', async () => {
      const addDto = {
        idRota: 999,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque' as const,
      };

      mockRotaRepository.findOne.mockResolvedValue(null);

      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        'Rota não encontrada',
      );
    });

    it('deve lançar NotFoundException quando ponto não existe', async () => {
      const addDto = {
        idRota: 1,
        idPonto: 999,
        ordem: 1,
        tipo: 'embarque' as const,
      };

      mockRotaRepository.findOne.mockResolvedValue({ id: 1 });
      mockPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        'Ponto não encontrado',
      );
    });

    it('deve lançar BadRequestException quando ponto já está vinculado', async () => {
      const addDto = {
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque' as const,
      };

      mockRotaRepository.findOne.mockResolvedValue({ id: 1 });
      mockPontoRepository.findOne.mockResolvedValue({ id: 1 });
      mockRotaPontoRepository.findOne.mockResolvedValue({ id: 1 });

      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addPontoToRota(addDto)).rejects.toThrow(
        'Ponto já vinculado a esta rota com este tipo',
      );
    });
  });

  describe('removePontoFromRota', () => {
    it('deve remover um ponto de uma rota', async () => {
      const mockRotaPonto = { id: 1, idRota: 1, idPonto: 1 };

      mockRotaPontoRepository.findOne.mockResolvedValue(mockRotaPonto);
      mockRotaPontoRepository.remove.mockResolvedValue(mockRotaPonto);

      await service.removePontoFromRota(1);

      expect(mockRotaPontoRepository.remove).toHaveBeenCalledWith(
        mockRotaPonto,
      );
    });

    it('deve lançar NotFoundException quando relação não existe', async () => {
      mockRotaPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.removePontoFromRota(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removePontoFromRota(999)).rejects.toThrow(
        'Relação não encontrada',
      );
    });
  });

  describe('togglePontoRota', () => {
    it('deve ativar um ponto inativo', async () => {
      const mockRotaPonto = { id: 1, idRota: 1, idPonto: 1, ativo: false };
      const updatedRotaPonto = { ...mockRotaPonto, ativo: true };

      mockRotaPontoRepository.findOne.mockResolvedValue(mockRotaPonto);
      mockRotaPontoRepository.save.mockResolvedValue(updatedRotaPonto);

      const result = await service.togglePontoRota(1);

      expect(result.ativo).toBe(true);
      expect(mockRotaPontoRepository.save).toHaveBeenCalledWith({
        ...mockRotaPonto,
        ativo: true,
      });
    });

    it('deve desativar um ponto ativo', async () => {
      const mockRotaPonto = { id: 1, idRota: 1, idPonto: 1, ativo: true };
      const updatedRotaPonto = { ...mockRotaPonto, ativo: false };

      mockRotaPontoRepository.findOne.mockResolvedValue(mockRotaPonto);
      mockRotaPontoRepository.save.mockResolvedValue(updatedRotaPonto);

      const result = await service.togglePontoRota(1);

      expect(result.ativo).toBe(false);
    });

    it('deve lançar NotFoundException quando relação não existe', async () => {
      mockRotaPontoRepository.findOne.mockResolvedValue(null);

      await expect(service.togglePontoRota(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
