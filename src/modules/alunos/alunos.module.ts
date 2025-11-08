import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './entities/aluno.entity';
import { Ponto } from '../pontos/ponto.entity';
import { Rota } from '../rotas/rota.entity';
import { RotaPassageiro } from '../rotas/rota-passageiro.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
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
    ]),
  ],
  controllers: [AlunosController],
  providers: [AlunosService],
  exports: [AlunosService, TypeOrmModule],
})
export class AlunosModule {}
