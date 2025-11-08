import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Get()
  async findAll() {
    const data = await this.empresasService.findAll();
    return {
      message: 'Dados encontrados',
      data,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const data = await this.empresasService.findOne(Number(id));
    return {
      message: 'Dados encontrados',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmpresaDto: CreateEmpresaDto) {
    const data = await this.empresasService.create(createEmpresaDto);
    return {
      message: 'Criado com sucesso!',
      data,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
  ) {
    const data = await this.empresasService.update(
      Number(id),
      updateEmpresaDto,
    );
    return {
      message: 'Atualizado com sucesso!',
      data,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const data = await this.empresasService.delete(Number(id));
    return {
      message: 'Registro excluído',
      data,
    };
  }
}
