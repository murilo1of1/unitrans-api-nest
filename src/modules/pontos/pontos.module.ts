import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PontosController } from './pontos.controller';
import { PontosService } from './pontos.service';
import { Ponto } from './entities/ponto.entity';
import { RotaPonto } from '../rotas/entities/rota-ponto.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Rota } from '../rotas/entities/rota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ponto, RotaPonto, Empresa, Rota])],
  controllers: [PontosController],
  providers: [PontosService],
  exports: [PontosService],
})
export class PontosModule {}
