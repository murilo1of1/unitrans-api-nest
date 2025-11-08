import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../../modules/alunos/entities/aluno.entity';
import { Empresa } from '../../modules/empresas/entities/empresa.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(Aluno)
    private alunosRepository: Repository<Aluno>,
    @InjectRepository(Empresa)
    private empresasRepository: Repository<Empresa>,
  ) {}

  async seed() {
    this.logger.log('[SEEDER] Iniciando seeding do banco de dados');

    await this.seedAlunos();
    await this.seedEmpresas();

    this.logger.log('[SEEDER] Seeding concluido');
  }

  private async seedAlunos() {
    const existingCount = await this.alunosRepository.count();

    if (existingCount >= 5) {
      this.logger.log('[SEEDER] Alunos ja existem no banco, pulando');
      return;
    }

    const passwordHash = await bcrypt.hash('senha123', 10);

    const alunos = [
      {
        nome: 'João Silva',
        email: 'joao.silva@test.com',
        cpf: '11111111111',
        passwordHash,
      },
      {
        nome: 'Maria Santos',
        email: 'maria.santos@test.com',
        cpf: '22222222222',
        passwordHash,
      },
      {
        nome: 'Pedro Oliveira',
        email: 'pedro.oliveira@test.com',
        cpf: '33333333333',
        passwordHash,
      },
      {
        nome: 'Ana Costa',
        email: 'ana.costa@test.com',
        cpf: '44444444444',
        passwordHash,
      },
      {
        nome: 'Lucas Ferreira',
        email: 'lucas.ferreira@test.com',
        cpf: '55555555555',
        passwordHash,
      },
    ];

    for (const alunoData of alunos) {
      const exists = await this.alunosRepository.findOne({
        where: [{ email: alunoData.email }, { cpf: alunoData.cpf }],
      });

      if (!exists) {
        await this.alunosRepository.save(alunoData);
        this.logger.log(`[SEEDER] Aluno criado: ${alunoData.nome}`);
      }
    }
  }

  private async seedEmpresas() {
    const existingCount = await this.empresasRepository.count();

    if (existingCount >= 3) {
      this.logger.log('[SEEDER] Empresas ja existem no banco, pulando');
      return;
    }

    const passwordHash = await bcrypt.hash('senha123', 10);

    const empresas = [
      {
        nome: 'Transportes Rápido Ltda',
        cnpj: '11111111000111',
        email: 'contato@rapidotransportes.com',
        passwordHash,
        tipoVinculo: 'ambos' as const,
      },
      {
        nome: 'ViaExpressa Transportes',
        cnpj: '22222222000122',
        email: 'comercial@viaexpressa.com',
        passwordHash,
        tipoVinculo: 'token' as const,
      },
      {
        nome: 'SeguroVan Transporte Escolar',
        cnpj: '33333333000133',
        email: 'atendimento@segurovan.com',
        passwordHash,
        tipoVinculo: 'pesquisa' as const,
      },
    ];

    for (const empresaData of empresas) {
      const exists = await this.empresasRepository.findOne({
        where: [{ email: empresaData.email }, { cnpj: empresaData.cnpj }],
      });

      if (!exists) {
        await this.empresasRepository.save(empresaData);
        this.logger.log(`[SEEDER] Empresa criada: ${empresaData.nome}`);
      }
    }
  }
}
