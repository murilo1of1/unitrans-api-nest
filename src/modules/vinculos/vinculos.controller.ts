import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VinculosService } from './vinculos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateVinculoDto } from './dtos/create-vinculo.dto';
import { FilterVinculoDto } from './dtos/filter-vinculo.dto';
import { GerarTokenDto } from './dtos/gerar-token.dto';
import { VincularPorTokenDto } from './dtos/vincular-por-token.dto';
import { CreateSolicitacaoDto } from './dtos/create-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dtos/rejeitar-solicitacao.dto';
import { FilterSolicitacaoDto } from './dtos/filter-solicitacao.dto';
import { StatusSolicitacao } from './entities/solicitacao-vinculo.entity';

@ApiTags('Vínculos')
@Controller('vinculos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VinculosController {
  constructor(private readonly vinculosService: VinculosService) {}

  // ==================== VÍNCULOS ====================

  @Post()
  @ApiOperation({ summary: 'Criar vínculo manualmente' })
  @ApiResponse({ status: 201, description: 'Vínculo criado com sucesso' })
  async criarVinculo(@Body() createVinculoDto: CreateVinculoDto) {
    const vinculo = await this.vinculosService.criarVinculo(createVinculoDto);
    return {
      message: 'Vínculo criado com sucesso!',
      data: vinculo,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar vínculos com filtros' })
  @ApiResponse({ status: 200, description: 'Vínculos encontrados' })
  async listarVinculos(@Query() filterDto: FilterVinculoDto) {
    const vinculos = await this.vinculosService.listarVinculos(filterDto);
    return {
      message: 'Vínculos encontrados',
      data: vinculos,
    };
  }

  @Get('aluno/:idAluno')
  @ApiOperation({ summary: 'Listar vínculos de um aluno' })
  @ApiResponse({ status: 200, description: 'Vínculos do aluno encontrados' })
  async listarVinculosAluno(
    @Param('idAluno', ParseIntPipe) idAluno: number,
    @Query('ativo') ativo?: string,
  ) {
    const ativoBoolean =
      ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    const vinculos = await this.vinculosService.listarVinculosAluno(
      idAluno,
      ativoBoolean,
    );
    return {
      message: 'Vínculos do aluno encontrados',
      data: vinculos,
    };
  }

  @Get('empresa/:idEmpresa')
  @ApiOperation({ summary: 'Listar vínculos de uma empresa' })
  @ApiResponse({ status: 200, description: 'Vínculos da empresa encontrados' })
  async listarVinculosEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Query('ativo') ativo?: string,
  ) {
    const ativoBoolean =
      ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    const vinculos = await this.vinculosService.listarVinculosEmpresa(
      idEmpresa,
      ativoBoolean,
    );
    return {
      message: 'Vínculos da empresa encontrados',
      data: vinculos,
    };
  }

  @Patch(':id/desativar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativar vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo desativado com sucesso' })
  async desativarVinculo(@Param('id', ParseIntPipe) id: number) {
    await this.vinculosService.desativarVinculo(id);
    return {
      message: 'Vínculo desativado com sucesso!',
    };
  }

  @Patch(':id/reativar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reativar vínculo' })
  @ApiResponse({ status: 200, description: 'Vínculo reativado com sucesso' })
  async reativarVinculo(@Param('id', ParseIntPipe) id: number) {
    await this.vinculosService.reativarVinculo(id);
    return {
      message: 'Vínculo reativado com sucesso!',
    };
  }

  // ==================== TOKENS ====================

  @Post('token')
  @ApiOperation({ summary: 'Gerar token de acesso para empresa' })
  @ApiResponse({ status: 201, description: 'Token gerado com sucesso' })
  async gerarToken(@Body() gerarTokenDto: GerarTokenDto) {
    const result = await this.vinculosService.gerarToken(gerarTokenDto);
    return {
      message: 'Token de acesso gerado com sucesso!',
      data: result,
    };
  }

  @Get('token')
  @ApiOperation({ summary: 'Listar tokens' })
  @ApiResponse({ status: 200, description: 'Tokens encontrados' })
  async listarTokens(
    @Query('empresaId', new ParseIntPipe({ optional: true }))
    empresaId?: number,
  ) {
    const tokens = await this.vinculosService.listarTokens(empresaId);
    return {
      message: 'Tokens encontrados',
      data: tokens,
    };
  }

  @Get('token/empresa/:idEmpresa')
  @ApiOperation({ summary: 'Listar tokens de uma empresa' })
  @ApiResponse({ status: 200, description: 'Tokens da empresa encontrados' })
  async listarTokensEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
  ) {
    const tokens = await this.vinculosService.listarTokensEmpresa(idEmpresa);
    return {
      message: 'Tokens da empresa encontrados',
      data: tokens,
    };
  }

  @Patch('token/:id/revogar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revogar token' })
  @ApiResponse({ status: 200, description: 'Token revogado com sucesso' })
  async revogarToken(@Param('id', ParseIntPipe) id: number) {
    await this.vinculosService.revogarToken(id);
    return {
      message: 'Token revogado com sucesso!',
    };
  }

  @Post('usar-token')
  @ApiOperation({ summary: 'Vincular aluno usando token' })
  @ApiResponse({ status: 201, description: 'Vínculo criado via token' })
  async vincularPorToken(@Body() vincularPorTokenDto: VincularPorTokenDto) {
    const vinculo =
      await this.vinculosService.vincularPorToken(vincularPorTokenDto);
    return {
      message: 'Vínculo criado via token com sucesso!',
      data: vinculo,
    };
  }

  // ==================== SOLICITAÇÕES ====================

  @Post('solicitacao')
  @ApiOperation({ summary: 'Criar solicitação de vínculo' })
  @ApiResponse({ status: 201, description: 'Solicitação criada com sucesso' })
  async solicitarVinculo(@Body() createSolicitacaoDto: CreateSolicitacaoDto) {
    const solicitacao =
      await this.vinculosService.solicitarVinculo(createSolicitacaoDto);
    return {
      message: 'Solicitação de vínculo enviada com sucesso!',
      data: solicitacao,
    };
  }

  @Get('solicitacao')
  @ApiOperation({ summary: 'Listar solicitações com filtros' })
  @ApiResponse({ status: 200, description: 'Solicitações encontradas' })
  async listarSolicitacoes(@Query() filterDto: FilterSolicitacaoDto) {
    const solicitacoes =
      await this.vinculosService.listarSolicitacoes(filterDto);
    return {
      message: 'Solicitações encontradas',
      data: solicitacoes,
    };
  }

  @Get('solicitacao/empresa/:idEmpresa')
  @ApiOperation({ summary: 'Listar solicitações de uma empresa' })
  @ApiResponse({
    status: 200,
    description: 'Solicitações da empresa encontradas',
  })
  async listarSolicitacoesEmpresa(
    @Param('idEmpresa', ParseIntPipe) idEmpresa: number,
    @Query('status') status?: StatusSolicitacao,
  ) {
    const solicitacoes = await this.vinculosService.listarSolicitacoesEmpresa(
      idEmpresa,
      status,
    );
    return {
      message: 'Solicitações da empresa encontradas',
      data: solicitacoes,
    };
  }

  @Get('solicitacao/aluno/:idAluno')
  @ApiOperation({ summary: 'Listar solicitações de um aluno' })
  @ApiResponse({
    status: 200,
    description: 'Solicitações do aluno encontradas',
  })
  async listarSolicitacoesAluno(
    @Param('idAluno', ParseIntPipe) idAluno: number,
    @Query('status') status?: StatusSolicitacao,
  ) {
    const solicitacoes = await this.vinculosService.listarSolicitacoesAluno(
      idAluno,
      status,
    );
    return {
      message: 'Solicitações do aluno encontradas',
      data: solicitacoes,
    };
  }

  @Patch('solicitacao/:id/aprovar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aprovar solicitação de vínculo' })
  @ApiResponse({
    status: 200,
    description: 'Solicitação aprovada e vínculo criado',
  })
  async aprovarSolicitacao(@Param('id', ParseIntPipe) id: number) {
    const vinculo = await this.vinculosService.aprovarSolicitacao(id);
    return {
      message: 'Solicitação aprovada e vínculo criado com sucesso!',
      data: vinculo,
    };
  }

  @Patch('solicitacao/:id/rejeitar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeitar solicitação de vínculo' })
  @ApiResponse({ status: 200, description: 'Solicitação rejeitada' })
  async rejeitarSolicitacao(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejeitarDto: RejeitarSolicitacaoDto,
  ) {
    await this.vinculosService.rejeitarSolicitacao(id, rejeitarDto);
    return {
      message: 'Solicitação rejeitada com sucesso!',
    };
  }
}
