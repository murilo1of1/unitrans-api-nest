import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './entities/aluno.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Rota } from '../rotas/entities/rota.entity';
import { RotaPassageiro } from '../rotas/entities/rota-passageiro.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { Plano } from '../planos/entities/plano.entity';
import { AlunosService } from './alunos.service';
import { AlunosController } from './alunos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aluno,
      Ponto,
      Rota,
      RotaPassageiro,
      EmpresaAluno,
      // Plano is required because Aluno has a ManyToOne relation to Plano
      // Ensure Plano metadata is registered so TypeORM can build relations
      // and synchronize the schema correctly.
      Plano,
    ]),
  ],
  controllers: [AlunosController],
  providers: [AlunosService],
  exports: [AlunosService, TypeOrmModule],
})
export class AlunosModule {}
