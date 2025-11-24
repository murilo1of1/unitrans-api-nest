import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RotasController } from './rotas.controller';
import { RotasService } from './rotas.service';
import { Rota } from './entities/rota.entity';
import { RotaPonto } from './entities/rota-ponto.entity';
import { RotaPassageiro } from './entities/rota-passageiro.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Aluno } from '../alunos/entities/aluno.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rota,
      RotaPonto,
      RotaPassageiro,
      Empresa,
      Ponto,
      Aluno,
      EmpresaAluno,
    ]),
  ],
  controllers: [RotasController],
  providers: [RotasService],
  exports: [RotasService],
})
export class RotasModule {}
