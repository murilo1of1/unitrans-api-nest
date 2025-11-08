import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
  ) {}

  async findAll() {
    return this.empresasRepository.find({
      where: {
        tipoVinculo: In(['ambos', 'pesquisa']),
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const empresa = await this.empresasRepository.findOne({
      where: { id },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return empresa;
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    const data: any = { ...createEmpresaDto };

    data.passwordHash = await bcrypt.hash(data.senha, 10);
    delete data.senha;

    const empresa = this.empresasRepository.create(data);
    const result: any = await this.empresasRepository.save(empresa);

    return this.empresasRepository.findOne({
      where: { id: result.id },
    });
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    const empresa = await this.empresasRepository.findOne({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');

    const data: any = { ...updateEmpresaDto };

    if (data.senha) {
      data.passwordHash = await bcrypt.hash(data.senha, 10);
      delete data.senha;
    }

    await this.empresasRepository.update(id, data);

    return this.empresasRepository.findOne({
      where: { id },
    });
  }

  async delete(id: number) {
    const empresa = await this.empresasRepository.findOne({ where: { id } });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');

    const empresaData = { ...empresa };
    await this.empresasRepository.remove(empresa);

    return {
      id: empresaData.id,
      nome: empresaData.nome,
      email: empresaData.email,
      cnpj: empresaData.cnpj,
    };
  }
}
