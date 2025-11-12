import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PontosService } from './pontos.service';
import { CreatePontoDto } from './dtos/create-ponto.dto';
import { UpdatePontoDto } from './dtos/update-ponto.dto';
import { AddPontoToRotaDto } from './dtos/add-ponto-to-rota.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pontos')
@Controller('pontos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PontosController {
  constructor(private readonly pontosService: PontosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os pontos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pontos retornada com sucesso',
  })
  async findAll() {
    const pontos = await this.pontosService.findAll();
    return {
      message: 'Dados encontrados',
      data: pontos,
    };
  }

  @Get('empresa/:idEmpresa')
  @ApiOperation({ summary: 'Listar pontos de uma empresa' })
  @ApiResponse({ status: 200, description: 'Pontos da empresa encontrados' })
  async findByEmpresa(@Param('idEmpresa', ParseIntPipe) idEmpresa: number) {
    const pontos = await this.pontosService.findByEmpresa(idEmpresa);
    return {
      message: 'Pontos da empresa encontrados',
      data: pontos,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar ponto por ID' })
  @ApiResponse({ status: 200, description: 'Ponto encontrado' })
  @ApiResponse({ status: 404, description: 'Ponto não encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const ponto = await this.pontosService.findOne(id);
    return {
      message: 'Dados encontrados',
      data: ponto,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo ponto' })
  @ApiResponse({ status: 201, description: 'Ponto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async create(@Body() createPontoDto: CreatePontoDto) {
    const ponto = await this.pontosService.create(createPontoDto);
    return {
      message: 'Ponto criado com sucesso',
      data: ponto,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ponto' })
  @ApiResponse({ status: 200, description: 'Ponto atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Ponto não encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePontoDto: UpdatePontoDto,
  ) {
    const ponto = await this.pontosService.update(id, updatePontoDto);
    return {
      message: 'Ponto atualizado com sucesso',
      data: ponto,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir ponto' })
  @ApiResponse({ status: 200, description: 'Ponto excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Ponto vinculado a rotas' })
  @ApiResponse({ status: 404, description: 'Ponto não encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.pontosService.delete(id);
    return {
      message: 'Ponto excluído com sucesso',
    };
  }

  @Post('rota')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar ponto a uma rota' })
  @ApiResponse({
    status: 201,
    description: 'Ponto adicionado à rota com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Ponto já vinculado ou dados inválidos',
  })
  @ApiResponse({ status: 404, description: 'Rota ou ponto não encontrado' })
  async addToRota(@Body() addPontoToRotaDto: AddPontoToRotaDto) {
    const rotaPonto =
      await this.pontosService.addPontoToRota(addPontoToRotaDto);
    return {
      message: 'Ponto adicionado à rota com sucesso',
      data: rotaPonto,
    };
  }

  @Delete('rota/:id')
  @ApiOperation({ summary: 'Remover ponto de uma rota' })
  @ApiResponse({
    status: 200,
    description: 'Ponto removido da rota com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Relação não encontrada' })
  async removeFromRota(@Param('id', ParseIntPipe) id: number) {
    await this.pontosService.removePontoFromRota(id);
    return {
      message: 'Ponto removido da rota com sucesso',
    };
  }

  @Patch('rota/:id/toggle')
  @ApiOperation({ summary: 'Alternar status ativo/inativo do ponto na rota' })
  @ApiResponse({ status: 200, description: 'Status alterado com sucesso' })
  @ApiResponse({ status: 404, description: 'Relação não encontrada' })
  async toggleAtivo(@Param('id', ParseIntPipe) id: number) {
    const rotaPonto = await this.pontosService.togglePontoRota(id);
    return {
      message: `Ponto ${rotaPonto.ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: rotaPonto,
    };
  }
}
