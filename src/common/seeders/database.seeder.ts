import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../../modules/alunos/entities/aluno.entity';
import { Empresa } from '../../modules/empresas/entities/empresa.entity';
import { EmpresaAluno } from '../../modules/empresas/entities/empresa-aluno.entity';
import { Ponto } from '../../modules/pontos/entities/ponto.entity';
import { Rota } from '../../modules/rotas/entities/rota.entity';
import { RotaPonto } from '../../modules/rotas/entities/rota-ponto.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(Aluno)
    private alunosRepository: Repository<Aluno>,
    @InjectRepository(Empresa)
    private empresasRepository: Repository<Empresa>,
    @InjectRepository(EmpresaAluno)
    private empresaAlunoRepository: Repository<EmpresaAluno>,
    @InjectRepository(Ponto)
    private pontosRepository: Repository<Ponto>,
    @InjectRepository(Rota)
    private rotasRepository: Repository<Rota>,
    @InjectRepository(RotaPonto)
    private rotaPontoRepository: Repository<RotaPonto>,
  ) {}

  async seed() {
    this.logger.log('[SEEDER] Iniciando seeding do banco de dados');

    const empresas = await this.seedEmpresas();
    const alunos = await this.seedAlunos();
    await this.seedVinculos(empresas, alunos);
    await this.seedRotasEPontos(empresas);

    this.logger.log('[SEEDER] Seeding concluído com sucesso!');
  }

  private async seedEmpresas(): Promise<Empresa[]> {
    this.logger.log('[SEEDER] Criando empresas...');
    const passwordHash = await bcrypt.hash('senha123', 10);

    const empresasData = [
      {
        nome: 'Transportes Rápido Ltda',
        cnpj: '11111111000111',
        email: 'empresa1@test.com',
        passwordHash,
        tipoVinculo: 'ambos' as const,
      },
      {
        nome: 'ViaExpressa Transportes',
        cnpj: '22222222000122',
        email: 'empresa2@test.com',
        passwordHash,
        tipoVinculo: 'token' as const,
      },
      {
        nome: 'SeguroVan Transporte Escolar',
        cnpj: '33333333000133',
        email: 'empresa3@test.com',
        passwordHash,
        tipoVinculo: 'pesquisa' as const,
      },
    ];

    const empresas: Empresa[] = [];
    for (const empresaData of empresasData) {
      const empresa = await this.empresasRepository.save(empresaData);
      empresas.push(empresa);
      this.logger.log(
        `  ✓ Empresa criada: ${empresa.nome} (ID: ${empresa.id})`,
      );
    }

    return empresas;
  }

  private async seedAlunos(): Promise<Aluno[]> {
    this.logger.log('[SEEDER] Criando alunos...');
    const passwordHash = await bcrypt.hash('senha123', 10);

    const alunosData = [
      // 15 alunos no total (5 + 4 + 3 + 3 extras)
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
      {
        nome: 'Julia Alves',
        email: 'julia.alves@test.com',
        cpf: '66666666666',
        passwordHash,
      },
      {
        nome: 'Carlos Souza',
        email: 'carlos.souza@test.com',
        cpf: '77777777777',
        passwordHash,
      },
      {
        nome: 'Beatriz Lima',
        email: 'beatriz.lima@test.com',
        cpf: '88888888888',
        passwordHash,
      },
      {
        nome: 'Rafael Martins',
        email: 'rafael.martins@test.com',
        cpf: '99999999999',
        passwordHash,
      },
      {
        nome: 'Fernanda Rocha',
        email: 'fernanda.rocha@test.com',
        cpf: '10101010101',
        passwordHash,
      },
      {
        nome: 'Gustavo Pereira',
        email: 'gustavo.pereira@test.com',
        cpf: '12121212121',
        passwordHash,
      },
      {
        nome: 'Camila Dias',
        email: 'camila.dias@test.com',
        cpf: '13131313131',
        passwordHash,
      },
      {
        nome: 'Bruno Ribeiro',
        email: 'bruno.ribeiro@test.com',
        cpf: '14141414141',
        passwordHash,
      },
      {
        nome: 'Larissa Cardoso',
        email: 'larissa.cardoso@test.com',
        cpf: '15151515151',
        passwordHash,
      },
      {
        nome: 'Thiago Mendes',
        email: 'thiago.mendes@test.com',
        cpf: '16161616161',
        passwordHash,
      },
    ];

    const alunos: Aluno[] = [];
    for (const alunoData of alunosData) {
      const aluno = await this.alunosRepository.save(alunoData);
      alunos.push(aluno);
      this.logger.log(`Aluno criado: ${aluno.nome} (ID: ${aluno.id})`);
    }

    return alunos;
  }

  private async seedVinculos(empresas: Empresa[], alunos: Aluno[]) {
    this.logger.log('[SEEDER] Criando vínculos empresa-aluno...');

    // Empresa 1: 5 alunos
    for (let i = 0; i < 5; i++) {
      await this.empresaAlunoRepository.save({
        empresaId: empresas[0].id,
        alunoId: alunos[i].id,
        ativo: true,
        origemVinculo: 'manual',
        vinculadoPor: 'seeder',
      });
    }
    this.logger.log(`${empresas[0].nome}: 5 alunos vinculados`);

    // Empresa 2: 4 alunos
    for (let i = 5; i < 9; i++) {
      await this.empresaAlunoRepository.save({
        empresaId: empresas[1].id,
        alunoId: alunos[i].id,
        ativo: true,
        origemVinculo: 'manual',
        vinculadoPor: 'seeder',
      });
    }
    this.logger.log(`${empresas[1].nome}: 4 alunos vinculados`);

    // Empresa 3: 3 alunos
    for (let i = 9; i < 12; i++) {
      await this.empresaAlunoRepository.save({
        empresaId: empresas[2].id,
        alunoId: alunos[i].id,
        ativo: true,
        origemVinculo: 'manual',
        vinculadoPor: 'seeder',
      });
    }
    this.logger.log(`${empresas[2].nome}: 3 alunos vinculados`);
  }

  private async seedRotasEPontos(empresas: Empresa[]) {
    this.logger.log('[SEEDER] Criando rotas e pontos...');
    for (let empIndex = 0; empIndex < empresas.length; empIndex++) {
      const empresa = empresas[empIndex];
      this.logger.log(`  📍 Empresa: ${empresa.nome}`);

      const pontos: Ponto[] = [];
      for (let p = 1; p <= 10; p++) {
        const ponto = await this.pontosRepository.save({
          idEmpresa: empresa.id,
          nome: `Ponto ${p} - ${empresa.nome.split(' ')[0]}`,
          endereco: `Rua Exemplo ${p}, nº ${p * 100}, Bairro ${p}`,
          latitude: -23.5 + p * 0.01,
          longitude: -46.6 + p * 0.01,
        });
        pontos.push(ponto);
      }
      this.logger.log(`    ✓ 10 pontos criados`);

      for (let r = 1; r <= 3; r++) {
        const rota = await this.rotasRepository.save({
          idEmpresa: empresa.id,
          nome: `Rota ${r} - ${empresa.nome.split(' ')[0]}`,
          origem: `Terminal ${r}`,
          destino:
            r === 1 ? 'Escola Central' : r === 2 ? 'Universidade' : 'Colégio',
        });

        const embarqueStart = (r - 1) * 3;
        const desembarqueStart = embarqueStart + 5;

        for (let ordem = 1; ordem <= 4; ordem++) {
          const pontoIndex = (embarqueStart + ordem - 1) % 10;
          await this.rotaPontoRepository.save({
            idRota: rota.id,
            idPonto: pontos[pontoIndex].id,
            ordem,
            tipo: 'embarque',
          });
        }

        for (let ordem = 1; ordem <= 4; ordem++) {
          const pontoIndex = (desembarqueStart + ordem - 1) % 10;
          await this.rotaPontoRepository.save({
            idRota: rota.id,
            idPonto: pontos[pontoIndex].id,
            ordem,
            tipo: 'desembarque',
          });
        }

        this.logger.log(
          `   ${rota.nome} criada com 8 pontos (4 embarque + 4 desembarque)`,
        );
      }
    }
  }
}
