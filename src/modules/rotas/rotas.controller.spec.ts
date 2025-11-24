import { Test, TestingModule } from '@nestjs/testing';
import { RotasController } from './rotas.controller';
import { RotasService } from './rotas.service';
import { CreateRotaDto } from './dtos/create-rota.dto';
import { UpdateRotaDto } from './dtos/update-rota.dto';
import { AddPontoRotaDto } from './dtos/add-ponto-rota.dto';
import { UpdatePontoRotaDto } from './dtos/update-ponto-rota.dto';
import { GetPassageirosRotaDto } from './dtos/get-passageiros-rota.dto';

describe('RotasController', () => {
  let controller: RotasController;
  let service: RotasService;

  const mockRotasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmpresa: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getPontosRota: jest.fn(),
    addPontoToRota: jest.fn(),
    removePontoFromRota: jest.fn(),
    updatePontoRota: jest.fn(),
    getPassageirosRota: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RotasController],
      providers: [
        {
          provide: RotasService,
          useValue: mockRotasService,
        },
      ],
    }).compile();

    controller = module.get<RotasController>(RotasController);
    service = module.get<RotasService>(RotasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de rotas', async () => {
      const mockRotas = [
        {
          id: 1,
          nome: 'Rota Centro-Bairro',
          origem: 'Centro',
          destino: 'Bairro Norte',
        },
        {
          id: 2,
          nome: 'Rota Campus-Centro',
          origem: 'Campus',
          destino: 'Centro',
        },
      ];

      mockRotasService.findAll.mockResolvedValue(mockRotas);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockRotas,
      });
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar uma rota por ID', async () => {
      const mockRota = {
        id: 1,
        nome: 'Rota Centro-Bairro',
        origem: 'Centro',
        destino: 'Bairro Norte',
      };

      mockRotasService.findOne.mockResolvedValue(mockRota);

      const result = await controller.findOne(1);

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockRota,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmpresa', () => {
    it('deve retornar rotas de uma empresa', async () => {
      const mockRotas = [
        {
          id: 1,
          nome: 'Rota Centro-Bairro',
          idEmpresa: 1,
          pontos: [],
        },
      ];

      mockRotasService.findByEmpresa.mockResolvedValue(mockRotas);

      const result = await controller.findByEmpresa(1);

      expect(result).toEqual({
        message: 'Rotas da empresa encontradas',
        data: mockRotas,
      });
      expect(service.findByEmpresa).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('deve criar uma nova rota', async () => {
      const createRotaDto: CreateRotaDto = {
        nome: 'Rota Nova',
        origem: 'Ponto A',
        destino: 'Ponto B',
        idEmpresa: 1,
      };

      const mockRota = {
        id: 1,
        ...createRotaDto,
      };

      mockRotasService.create.mockResolvedValue(mockRota);

      const result = await controller.create(createRotaDto);

      expect(result).toEqual({
        message: 'Rota criada com sucesso',
        data: mockRota,
      });
      expect(service.create).toHaveBeenCalledWith(createRotaDto);
    });
  });

  describe('update', () => {
    it('deve atualizar uma rota', async () => {
      const updateRotaDto: UpdateRotaDto = {
        nome: 'Rota Atualizada',
      };

      const mockRota = {
        id: 1,
        nome: 'Rota Atualizada',
        origem: 'Centro',
        destino: 'Bairro',
      };

      mockRotasService.update.mockResolvedValue(mockRota);

      const result = await controller.update(1, updateRotaDto);

      expect(result).toEqual({
        message: 'Rota atualizada com sucesso',
        data: mockRota,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateRotaDto);
    });
  });

  describe('delete', () => {
    it('deve deletar uma rota', async () => {
      mockRotasService.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1);

      expect(result).toEqual({
        message: 'Rota excluída com sucesso',
      });
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('getPontosRota', () => {
    it('deve retornar pontos da rota', async () => {
      const mockPontos = [
        {
          id: 1,
          ordem: 1,
          tipo: 'embarque',
          ativo: true,
          ponto: {
            id: 1,
            nome: 'Terminal Central',
            endereco: 'Av. Principal, 100',
          },
        },
      ];

      mockRotasService.getPontosRota.mockResolvedValue(mockPontos);

      const result = await controller.getPontosRota(1);

      expect(result).toEqual({
        message: 'Pontos da rota encontrados',
        data: mockPontos,
      });
      expect(service.getPontosRota).toHaveBeenCalledWith(1);
    });
  });

  describe('addPontoToRota', () => {
    it('deve adicionar ponto à rota', async () => {
      const addPontoDto: AddPontoRotaDto = {
        idPonto: 1,
        tipo: 'embarque',
        ordem: 1,
      };

      const mockRotaPonto = {
        id: 1,
        idRota: 1,
        ...addPontoDto,
        ativo: true,
      };

      mockRotasService.addPontoToRota.mockResolvedValue(mockRotaPonto);

      const result = await controller.addPontoToRota(1, addPontoDto);

      expect(result).toEqual({
        message: 'Ponto adicionado à rota com sucesso',
        data: mockRotaPonto,
      });
      expect(service.addPontoToRota).toHaveBeenCalledWith(1, addPontoDto);
    });
  });

  describe('removePontoFromRota', () => {
    it('deve remover ponto da rota', async () => {
      mockRotasService.removePontoFromRota.mockResolvedValue(undefined);

      const result = await controller.removePontoFromRota(1);

      expect(result).toEqual({
        message: 'Ponto removido da rota com sucesso',
      });
      expect(service.removePontoFromRota).toHaveBeenCalledWith(1);
    });
  });

  describe('updatePontoRota', () => {
    it('deve atualizar ponto na rota', async () => {
      const updateDto: UpdatePontoRotaDto = {
        ordem: 2,
        ativo: false,
      };

      const mockRotaPonto = {
        id: 1,
        idRota: 1,
        idPonto: 1,
        ordem: 2,
        tipo: 'embarque' as const,
        ativo: false,
      };

      mockRotasService.updatePontoRota.mockResolvedValue(mockRotaPonto);

      const result = await controller.updatePontoRota(1, updateDto);

      expect(result).toEqual({
        message: 'Ponto da rota atualizado com sucesso',
        data: mockRotaPonto,
      });
      expect(service.updatePontoRota).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('getPassageirosRota', () => {
    it('deve retornar passageiros da rota', async () => {
      const getPassageirosDto: GetPassageirosRotaDto = {
        idRota: 1,
        tipo: 'embarque',
      };

      const mockPassageiros = {
        rota: {
          id: 1,
          nome: 'Rota Teste',
        },
        tipo: 'embarque',
        data: '2024-11-24',
        pontosComPassageiros: [
          {
            ponto: {
              id: 1,
              nome: 'Terminal Central',
              endereco: 'Av. Principal, 100',
              ordem: 1,
              tipo: 'embarque',
            },
            passageiros: [
              {
                id: 1,
                nome: 'Aluno Teste',
                email: 'aluno@test.com',
                pontoEmbarque: { id: 1, nome: 'Terminal Central' },
                pontoDesembarque: { id: 2, nome: 'Campus' },
              },
            ],
            totalPassageiros: 1,
          },
        ],
        totalPontos: 1,
        totalPassageiros: 1,
      };

      mockRotasService.getPassageirosRota.mockResolvedValue(mockPassageiros);

      const result = await controller.getPassageirosRota(getPassageirosDto);

      expect(result).toEqual({
        message: 'Passageiros da rota encontrados',
        data: mockPassageiros,
      });
      expect(service.getPassageirosRota).toHaveBeenCalledWith(
        getPassageirosDto,
      );
    });
  });
});
