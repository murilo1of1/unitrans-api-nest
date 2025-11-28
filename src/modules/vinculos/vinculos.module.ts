import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinculosController } from './vinculos.controller';
import { VinculosService } from './vinculos.service';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { SolicitacaoVinculo } from './entities/solicitacao-vinculo.entity';
import { TokenAcesso } from './entities/token-acesso.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Aluno } from '../alunos/entities/aluno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmpresaAluno,
      SolicitacaoVinculo,
      TokenAcesso,
      Empresa,
      Aluno,
    ]),
  ],
  controllers: [VinculosController],
  providers: [VinculosService],
  exports: [VinculosService],
})
export class VinculosModule {}
