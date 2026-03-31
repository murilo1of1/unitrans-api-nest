import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dtos/create-aluno.dto';
import { UpdateAlunoDto } from './dtos/update-aluno.dto';
import { SalvarEscolhasPontosDto } from './dtos/salvar-escolhas-pontos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Get()
  async getAll() {
    const data = await this.alunosService.findAll();
    return {
      message: 'Dados encontrados',
      data,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.alunosService.findOne(Number(id));
    return {
      message: 'Dados encontrados',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAlunoDto: CreateAlunoDto) {
    const data = await this.alunosService.create(createAlunoDto);
    return {
      message: 'Criado com sucesso!',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAlunoDto: UpdateAlunoDto,
  ) {
    const data = await this.alunosService.update(Number(id), updateAlunoDto);
    return {
      message: 'Atualizado com sucesso!',
      data,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.alunosService.delete(Number(id));
    return {
      message: 'Registro excluído',
      data,
    };
  }

  @Post('escolher-pontos')
  @UseGuards(JwtAuthGuard)
  async salvarEscolhasPontos(@Body() dto: SalvarEscolhasPontosDto) {
    return this.alunosService.salvarEscolhasPontos(dto);
  }
}
