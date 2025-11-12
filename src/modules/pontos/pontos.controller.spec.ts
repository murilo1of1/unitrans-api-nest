import { Test, TestingModule } from '@nestjs/testing';
import { PontosController } from './pontos.controller';
import { PontosService } from './pontos.service';
import { CreatePontoDto } from './dtos/create-ponto.dto';
import { UpdatePontoDto } from './dtos/update-ponto.dto';
import { AddPontoToRotaDto } from './dtos/add-ponto-to-rota.dto';

describe('PontosController', () => {
  let controller: PontosController;
  let service: PontosService;

  const mockPontosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmpresa: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addPontoToRota: jest.fn(),
    removePontoFromRota: jest.fn(),
    togglePontoRota: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PontosController],
      providers: [
        {
          provide: PontosService,
          useValue: mockPontosService,
        },
      ],
    }).compile();

    controller = module.get<PontosController>(PontosController);
    service = module.get<PontosService>(PontosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de pontos', async () => {
      const mockPontos = [
        { id: 1, nome: 'Ponto A', endereco: 'Rua A, 123' },
        { id: 2, nome: 'Ponto B', endereco: 'Rua B, 456' },
      ];

      mockPontosService.findAll.mockResolvedValue(mockPontos);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockPontos,
      });
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByEmpresa', () => {
    it('deve retornar pontos de uma empresa', async () => {
      const mockPontos = [
        { id: 1, nome: 'Ponto A', idEmpresa: 1 },
        { id: 2, nome: 'Ponto B', idEmpresa: 1 },
      ];

      mockPontosService.findByEmpresa.mockResolvedValue(mockPontos);

      const result = await controller.findByEmpresa(1);

      expect(result).toEqual({
        message: 'Pontos da empresa encontrados',
        data: mockPontos,
      });
      expect(service.findByEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar um ponto por ID', async () => {
      const mockPonto = { id: 1, nome: 'Ponto A', endereco: 'Rua A, 123' };

      mockPontosService.findOne.mockResolvedValue(mockPonto);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockPonto,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('deve criar um novo ponto', async () => {
      const createDto: CreatePontoDto = {
        nome: 'Ponto A',
        endereco: 'Rua A, 123',
        latitude: -23.5505,
        longitude: -46.6333,
        idEmpresa: 1,
      };

      const mockPonto = { id: 1, ...createDto };

      mockPontosService.create.mockResolvedValue(mockPonto);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        message: 'Ponto criado com sucesso',
        data: mockPonto,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('deve atualizar um ponto', async () => {
      const updateDto: UpdatePontoDto = {
        nome: 'Ponto A Atualizado',
      };

      const mockPonto = {
        id: 1,
        nome: 'Ponto A Atualizado',
        endereco: 'Rua A, 123',
      };

      mockPontosService.update.mockResolvedValue(mockPonto);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual({
        message: 'Ponto atualizado com sucesso',
        data: mockPonto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('deve deletar um ponto', async () => {
      mockPontosService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1);

      expect(result).toEqual({
        message: 'Ponto excluído com sucesso',
      });
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('addToRota', () => {
    it('deve adicionar ponto a uma rota', async () => {
      const addDto: AddPontoToRotaDto = {
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque',
        ativo: true,
      };

      const mockRotaPonto = { id: 1, ...addDto };

      mockPontosService.addPontoToRota.mockResolvedValue(mockRotaPonto);

      const result = await controller.addToRota(addDto);

      expect(result).toEqual({
        message: 'Ponto adicionado à rota com sucesso',
        data: mockRotaPonto,
      });
      expect(service.addPontoToRota).toHaveBeenCalledWith(addDto);
    });
  });

  describe('removeFromRota', () => {
    it('deve remover ponto de uma rota', async () => {
      mockPontosService.removePontoFromRota.mockResolvedValue(undefined);

      const result = await controller.removeFromRota(1);

      expect(result).toEqual({
        message: 'Ponto removido da rota com sucesso',
      });
      expect(service.removePontoFromRota).toHaveBeenCalledWith(1);
    });
  });

  describe('toggleAtivo', () => {
    it('deve ativar um ponto na rota', async () => {
      const mockRotaPonto = {
        id: 1,
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque' as const,
        ativo: true,
      };

      mockPontosService.togglePontoRota.mockResolvedValue(mockRotaPonto);

      const result = await controller.toggleAtivo(1);

      expect(result).toEqual({
        message: 'Ponto ativado com sucesso',
        data: mockRotaPonto,
      });
      expect(service.togglePontoRota).toHaveBeenCalledWith(1);
    });

    it('deve desativar um ponto na rota', async () => {
      const mockRotaPonto = {
        id: 1,
        idRota: 1,
        idPonto: 1,
        ordem: 1,
        tipo: 'embarque' as const,
        ativo: false,
      };

      mockPontosService.togglePontoRota.mockResolvedValue(mockRotaPonto);

      const result = await controller.toggleAtivo(1);

      expect(result).toEqual({
        message: 'Ponto desativado com sucesso',
        data: mockRotaPonto,
      });
      expect(service.togglePontoRota).toHaveBeenCalledWith(1);
    });
  });
});
