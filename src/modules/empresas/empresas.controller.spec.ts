import { Test, TestingModule } from '@nestjs/testing';
import { EmpresasController } from './empresas.controller';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('EmpresasController', () => {
  let controller: EmpresasController;
  let service: EmpresasService;

  const mockEmpresasService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpresasController],
      providers: [
        {
          provide: EmpresasService,
          useValue: mockEmpresasService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<EmpresasController>(EmpresasController);
    service = module.get<EmpresasService>(EmpresasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista de empresas', async () => {
      const mockEmpresas = [
        {
          id: 1,
          nome: 'Empresa 1',
          cnpj: '12345678000190',
          email: 'empresa1@test.com',
          tipoVinculo: 'ambos',
        },
      ];

      mockEmpresasService.findAll.mockResolvedValue(mockEmpresas);

      const result = await controller.findAll();

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockEmpresas,
      });
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('getOne', () => {
    it('deve retornar uma empresa por ID', async () => {
      const mockEmpresa = {
        id: 1,
        nome: 'Empresa Test',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasService.findOne.mockResolvedValue(mockEmpresa);

      const result = await controller.getOne('1');

      expect(result).toEqual({
        message: 'Dados encontrados',
        data: mockEmpresa,
      });
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('deve criar uma nova empresa', async () => {
      const createDto: CreateEmpresaDto = {
        nome: 'Nova Empresa',
        cnpj: '12345678000190',
        email: 'nova@empresa.com',
        senha: 'senha123',
        tipoVinculo: 'ambos',
      };

      const mockCreatedEmpresa = {
        id: 1,
        nome: 'Nova Empresa',
        cnpj: '12345678000190',
        email: 'nova@empresa.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasService.create.mockResolvedValue(mockCreatedEmpresa);

      const result = await controller.create(createDto);

      expect(result).toEqual({
        message: 'Criado com sucesso!',
        data: mockCreatedEmpresa,
      });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('deve atualizar uma empresa existente', async () => {
      const updateDto: UpdateEmpresaDto = {
        nome: 'Empresa Atualizada',
      };

      const mockUpdatedEmpresa = {
        id: 1,
        nome: 'Empresa Atualizada',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasService.update.mockResolvedValue(mockUpdatedEmpresa);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({
        message: 'Atualizado com sucesso!',
        data: mockUpdatedEmpresa,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('delete', () => {
    it('deve deletar uma empresa', async () => {
      const mockDeletedEmpresa = {
        id: 1,
        nome: 'Empresa Test',
        email: 'empresa@test.com',
        cnpj: '12345678000190',
      };

      mockEmpresasService.delete.mockResolvedValue(mockDeletedEmpresa);

      const result = await controller.delete('1');

      expect(result).toEqual({
        message: 'Registro excluído',
        data: mockDeletedEmpresa,
      });
      expect(service.delete).toHaveBeenCalledWith(1);
    });
  });
});
