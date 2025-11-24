import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RotasService } from './rotas.service';
import { CreateRotaDto } from './dtos/create-rota.dto';
import { UpdateRotaDto } from './dtos/update-rota.dto';
import { AddPontoRotaDto } from './dtos/add-ponto-rota.dto';
import { UpdatePontoRotaDto } from './dtos/update-ponto-rota.dto';
import { GetPassageirosRotaDto } from './dtos/get-passageiros-rota.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rotas')
@UseGuards(JwtAuthGuard)
export class RotasController {
  constructor(private readonly rotasService: RotasService) {}

  @Get()
  async findAll() {
    const rotas = await this.rotasService.findAll();
    return {
      message: 'Dados encontrados',
      data: rotas,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const rota = await this.rotasService.findOne(id);
    return {
      message: 'Dados encontrados',
      data: rota,
    };
  }

  @Get('empresa/:idEmpresa')
  async findByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    const rotas = await this.rotasService.findByEmpresa(idEmpresa);
    return {
      message: 'Rotas da empresa encontradas',
      data: rotas,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRotaDto: CreateRotaDto) {
    const rota = await this.rotasService.create(createRotaDto);
    return {
      message: 'Rota criada com sucesso',
      data: rota,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRotaDto: UpdateRotaDto,
  ) {
    const rota = await this.rotasService.update(id, updateRotaDto);
    return {
      message: 'Rota atualizada com sucesso',
      data: rota,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.rotasService.delete(id);
    return {
      message: 'Rota excluída com sucesso',
    };
  }

  // Gerenciar pontos da rota
  @Get(':idRota/pontos')
  async getPontosRota(@Param('idRota', ParseIntPipe) idRota: number) {
    const pontos = await this.rotasService.getPontosRota(idRota);
    return {
      message: 'Pontos da rota encontrados',
      data: pontos,
    };
  }

  @Post(':idRota/pontos')
  @HttpCode(HttpStatus.CREATED)
  async addPontoToRota(
    @Param('idRota', ParseIntPipe) idRota: number,
    @Body() addPontoRotaDto: AddPontoRotaDto,
  ) {
    const rotaPonto = await this.rotasService.addPontoToRota(
      idRota,
      addPontoRotaDto,
    );
    return {
      message: 'Ponto adicionado à rota com sucesso',
      data: rotaPonto,
    };
  }

  @Delete(':idRota/pontos/:idRotaPonto')
  @HttpCode(HttpStatus.OK)
  async removePontoFromRota(
    @Param('idRotaPonto', ParseIntPipe) idRotaPonto: number,
  ) {
    await this.rotasService.removePontoFromRota(idRotaPonto);
    return {
      message: 'Ponto removido da rota com sucesso',
    };
  }

  @Patch(':idRota/pontos/:idRotaPonto')
  @HttpCode(HttpStatus.OK)
  async updatePontoRota(
    @Param('idRotaPonto', ParseIntPipe) idRotaPonto: number,
    @Body() updatePontoRotaDto: UpdatePontoRotaDto,
  ) {
    const rotaPonto = await this.rotasService.updatePontoRota(
      idRotaPonto,
      updatePontoRotaDto,
    );
    return {
      message: 'Ponto da rota atualizado com sucesso',
      data: rotaPonto,
    };
  }

  // Buscar passageiros da rota
  @Post('passageiros')
  @HttpCode(HttpStatus.OK)
  async getPassageirosRota(
    @Body() getPassageirosRotaDto: GetPassageirosRotaDto,
  ) {
    const passageiros = await this.rotasService.getPassageirosRota(
      getPassageirosRotaDto,
    );
    return {
      message: 'Passageiros da rota encontrados',
      data: passageiros,
    };
  }
}
