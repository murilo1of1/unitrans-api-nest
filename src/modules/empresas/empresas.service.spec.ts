import { Test, TestingModule } from '@nestjs/testing';
import { EmpresasService } from './empresas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('EmpresasService', () => {
  let service: EmpresasService;
  let repository: Repository<Empresa>;

  const mockEmpresasRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresasService,
        {
          provide: getRepositoryToken(Empresa),
          useValue: mockEmpresasRepository,
        },
      ],
    }).compile();

    service = module.get<EmpresasService>(EmpresasService);
    repository = module.get<Repository<Empresa>>(getRepositoryToken(Empresa));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar array de empresas filtradas por tipoVinculo', async () => {
      const mockEmpresas = [
        {
          id: 1,
          nome: 'Empresa 1',
          cnpj: '12345678000190',
          email: 'empresa1@test.com',
          tipoVinculo: 'ambos',
        },
        {
          id: 2,
          nome: 'Empresa 2',
          cnpj: '98765432000190',
          email: 'empresa2@test.com',
          tipoVinculo: 'pesquisa',
        },
      ];

      mockEmpresasRepository.find.mockResolvedValue(mockEmpresas);

      const result = await service.findAll();

      expect(result).toEqual(mockEmpresas);
      expect(mockEmpresasRepository.find).toHaveBeenCalledWith({
        where: {
          tipoVinculo: In(['ambos', 'pesquisa']),
        },
        order: { id: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma empresa quando encontrada', async () => {
      const mockEmpresa = {
        id: 1,
        nome: 'Empresa Test',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasRepository.findOne.mockResolvedValue(mockEmpresa);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEmpresa);
      expect(mockEmpresasRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('deve lançar NotFoundException quando empresa não for encontrada', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Empresa não encontrada',
      );
    });
  });

  describe('create', () => {
    it('deve criar uma nova empresa com senha hasheada', async () => {
      const createDto: CreateEmpresaDto = {
        nome: 'Nova Empresa',
        cnpj: '12345678000190',
        email: 'nova@empresa.com',
        senha: 'senha123',
        tipoVinculo: 'ambos',
      };

      const mockCreatedEmpresa = {
        id: 1,
        ...createDto,
        passwordHash: 'hashedPassword',
      };

      const mockSavedEmpresa = {
        id: 1,
        nome: 'Nova Empresa',
        cnpj: '12345678000190',
        email: 'nova@empresa.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasRepository.create.mockReturnValue(mockCreatedEmpresa);
      mockEmpresasRepository.save.mockResolvedValue(mockCreatedEmpresa);
      mockEmpresasRepository.findOne.mockResolvedValue(mockSavedEmpresa);

      const result = await service.create(createDto);

      expect(result).toEqual(mockSavedEmpresa);
      expect(mockEmpresasRepository.create).toHaveBeenCalled();
      expect(mockEmpresasRepository.save).toHaveBeenCalled();
      expect(mockEmpresasRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar uma empresa existente', async () => {
      const updateDto: UpdateEmpresaDto = {
        nome: 'Empresa Atualizada',
        tipoVinculo: 'pesquisa',
      };

      const mockEmpresa = {
        id: 1,
        nome: 'Empresa Original',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      const mockUpdatedEmpresa = {
        ...mockEmpresa,
        ...updateDto,
      };

      mockEmpresasRepository.findOne
        .mockResolvedValueOnce(mockEmpresa)
        .mockResolvedValueOnce(mockUpdatedEmpresa);
      mockEmpresasRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, updateDto);

      expect(result).toEqual(mockUpdatedEmpresa);
      expect(mockEmpresasRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('deve atualizar senha quando fornecida', async () => {
      const updateDto: UpdateEmpresaDto = {
        senha: 'novaSenha123',
      };

      const mockEmpresa = {
        id: 1,
        nome: 'Empresa Test',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasRepository.findOne.mockResolvedValue(mockEmpresa);
      mockEmpresasRepository.update.mockResolvedValue({ affected: 1 });

      await service.update(1, updateDto);

      expect(mockEmpresasRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          passwordHash: 'hashedPassword',
        }),
      );
    });

    it('deve lançar NotFoundException quando empresa não for encontrada', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(null);

      const updateDto: UpdateEmpresaDto = { nome: 'Teste' };

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deve remover uma empresa existente', async () => {
      const mockEmpresa = {
        id: 1,
        nome: 'Empresa Test',
        cnpj: '12345678000190',
        email: 'empresa@test.com',
        tipoVinculo: 'ambos',
      };

      mockEmpresasRepository.findOne.mockResolvedValue(mockEmpresa);
      mockEmpresasRepository.remove.mockResolvedValue(mockEmpresa);

      const result = await service.delete(1);

      expect(result).toEqual({
        id: 1,
        nome: 'Empresa Test',
        email: 'empresa@test.com',
        cnpj: '12345678000190',
      });
      expect(mockEmpresasRepository.remove).toHaveBeenCalledWith(mockEmpresa);
    });

    it('deve lançar NotFoundException quando empresa não for encontrada', async () => {
      mockEmpresasRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow(
        'Empresa não encontrada',
      );
    });
  });
});
