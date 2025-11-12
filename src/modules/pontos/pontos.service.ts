import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ponto } from './entities/ponto.entity';
import { RotaPonto } from '../rotas/entities/rota-ponto.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Rota } from '../rotas/entities/rota.entity';
import { CreatePontoDto } from './dtos/create-ponto.dto';
import { UpdatePontoDto } from './dtos/update-ponto.dto';
import { AddPontoToRotaDto } from './dtos/add-ponto-to-rota.dto';

@Injectable()
export class PontosService {
  constructor(
    @InjectRepository(Ponto)
    private readonly pontoRepository: Repository<Ponto>,
    @InjectRepository(RotaPonto)
    private readonly rotaPontoRepository: Repository<RotaPonto>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Rota)
    private readonly rotaRepository: Repository<Rota>,
  ) {}

  async findAll(): Promise<Ponto[]> {
    return this.pontoRepository.find({
      relations: ['empresa'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Ponto> {
    const ponto = await this.pontoRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!ponto) {
      throw new NotFoundException('Ponto não encontrado');
    }

    return ponto;
  }

  async findByEmpresa(idEmpresa: number): Promise<Ponto[]> {
    return this.pontoRepository.find({
      where: { idEmpresa },
      order: { nome: 'ASC' },
    });
  }

  async create(createPontoDto: CreatePontoDto): Promise<Ponto> {
    const { idEmpresa, ...restDto } = createPontoDto;

    // Verificar se a empresa existe
    const empresa = await this.empresaRepository.findOne({
      where: { id: idEmpresa },
    });
    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const ponto = this.pontoRepository.create({
      ...restDto,
      idEmpresa,
    });

    return this.pontoRepository.save(ponto);
  }

  async update(id: number, updatePontoDto: UpdatePontoDto): Promise<Ponto> {
    const ponto = await this.pontoRepository.findOne({ where: { id } });
    if (!ponto) {
      throw new NotFoundException('Ponto não encontrado');
    }

    // Verificar se está tentando mudar a empresa e se ela existe
    if (updatePontoDto.idEmpresa) {
      const empresa = await this.empresaRepository.findOne({
        where: { id: updatePontoDto.idEmpresa },
      });
      if (!empresa) {
        throw new NotFoundException('Empresa não encontrada');
      }
    }

    Object.assign(ponto, updatePontoDto);
    return this.pontoRepository.save(ponto);
  }

  async delete(id: number): Promise<void> {
    const ponto = await this.pontoRepository.findOne({ where: { id } });
    if (!ponto) {
      throw new NotFoundException('Ponto não encontrado');
    }

    // Verificar se o ponto está vinculado a alguma rota
    const rotaPontos = await this.rotaPontoRepository.find({
      where: { idPonto: id },
    });

    if (rotaPontos.length > 0) {
      throw new BadRequestException(
        'Não é possível excluir ponto vinculado a rotas',
      );
    }

    await this.pontoRepository.remove(ponto);
  }

  async addPontoToRota(
    addPontoToRotaDto: AddPontoToRotaDto,
  ): Promise<RotaPonto> {
    const { idRota, idPonto, ordem, tipo, ativo = true } = addPontoToRotaDto;

    // Verificar se a rota existe
    const rota = await this.rotaRepository.findOne({ where: { id: idRota } });
    if (!rota) {
      throw new NotFoundException('Rota não encontrada');
    }

    // Verificar se o ponto existe
    const ponto = await this.pontoRepository.findOne({
      where: { id: idPonto },
    });
    if (!ponto) {
      throw new NotFoundException('Ponto não encontrado');
    }

    // Verificar se já existe essa relação
    const existeRelacao = await this.rotaPontoRepository.findOne({
      where: { idRota, idPonto, tipo },
    });

    if (existeRelacao) {
      throw new BadRequestException(
        'Ponto já vinculado a esta rota com este tipo',
      );
    }

    const rotaPonto = this.rotaPontoRepository.create({
      idRota,
      idPonto,
      ordem,
      tipo,
      ativo,
    });

    return this.rotaPontoRepository.save(rotaPonto);
  }

  async removePontoFromRota(id: number): Promise<void> {
    const rotaPonto = await this.rotaPontoRepository.findOne({ where: { id } });
    if (!rotaPonto) {
      throw new NotFoundException('Relação não encontrada');
    }

    await this.rotaPontoRepository.remove(rotaPonto);
  }

  async togglePontoRota(id: number): Promise<RotaPonto> {
    const rotaPonto = await this.rotaPontoRepository.findOne({ where: { id } });
    if (!rotaPonto) {
      throw new NotFoundException('Relação não encontrada');
    }

    rotaPonto.ativo = !rotaPonto.ativo;
    return this.rotaPontoRepository.save(rotaPonto);
  }
}
