import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Rota } from './entities/rota.entity';
import { RotaPonto } from './entities/rota-ponto.entity';
import { RotaPassageiro } from './entities/rota-passageiro.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Aluno } from '../alunos/entities/aluno.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { CreateRotaDto } from './dtos/create-rota.dto';
import { UpdateRotaDto } from './dtos/update-rota.dto';
import { AddPontoRotaDto } from './dtos/add-ponto-rota.dto';
import { UpdatePontoRotaDto } from './dtos/update-ponto-rota.dto';
import { GetPassageirosRotaDto } from './dtos/get-passageiros-rota.dto';

@Injectable()
export class RotasService {
  constructor(
    @InjectRepository(Rota)
    private readonly rotaRepository: Repository<Rota>,
    @InjectRepository(RotaPonto)
    private readonly rotaPontoRepository: Repository<RotaPonto>,
    @InjectRepository(RotaPassageiro)
    private readonly rotaPassageiroRepository: Repository<RotaPassageiro>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    @InjectRepository(Ponto)
    private readonly pontoRepository: Repository<Ponto>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(EmpresaAluno)
    private readonly empresaAlunoRepository: Repository<EmpresaAluno>,
  ) {}

  async findAll(): Promise<Rota[]> {
    return await this.rotaRepository.find({
      relations: ['empresa'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Rota> {
    const rota = await this.rotaRepository.findOne({
      where: { id },
      relations: ['empresa'],
    });

    if (!rota) {
      throw new NotFoundException('Rota não encontrada');
    }

    return rota;
  }

  async findByEmpresa(idEmpresa: number): Promise<any[]> {
    const rotas = await this.rotaRepository.find({
      where: { idEmpresa },
      order: { id: 'DESC' },
    });

    // Buscar pontos de cada rota
    const rotasComPontos = await Promise.all(
      rotas.map(async (rota) => {
        const pontos = await this.rotaPontoRepository.find({
          where: { idRota: rota.id },
          relations: ['ponto'],
          order: { ordem: 'ASC' },
        });

        return {
          ...rota,
          pontos: pontos.map((rp) => ({
            id: rp.id,
            ordem: rp.ordem,
            tipo: rp.tipo,
            ativo: rp.ativo,
            ponto: {
              id: rp.ponto.id,
              nome: rp.ponto.nome,
              endereco: rp.ponto.endereco,
              latitude: rp.ponto.latitude,
              longitude: rp.ponto.longitude,
            },
          })),
        };
      }),
    );

    return rotasComPontos;
  }

  async create(createRotaDto: CreateRotaDto): Promise<Rota> {
    const empresa = await this.empresaRepository.findOne({
      where: { id: createRotaDto.idEmpresa },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const rota = this.rotaRepository.create(createRotaDto);
    return await this.rotaRepository.save(rota);
  }

  async update(id: number, updateRotaDto: UpdateRotaDto): Promise<Rota> {
    const rota = await this.findOne(id);

    Object.assign(rota, updateRotaDto);
    return await this.rotaRepository.save(rota);
  }

  async delete(id: number): Promise<void> {
    const rota = await this.findOne(id);
    await this.rotaRepository.remove(rota);
  }

  // Gerenciar pontos da rota
  async getPontosRota(idRota: number): Promise<any> {
    const rota = await this.findOne(idRota);

    const pontos = await this.rotaPontoRepository.find({
      where: { idRota },
      relations: ['ponto'],
      order: { ordem: 'ASC' },
    });

    return pontos.map((rp) => ({
      id: rp.id,
      ordem: rp.ordem,
      tipo: rp.tipo,
      ativo: rp.ativo,
      ponto: {
        id: rp.ponto.id,
        nome: rp.ponto.nome,
        endereco: rp.ponto.endereco,
        latitude: rp.ponto.latitude,
        longitude: rp.ponto.longitude,
      },
    }));
  }

  async addPontoToRota(
    idRota: number,
    addPontoRotaDto: AddPontoRotaDto,
  ): Promise<RotaPonto> {
    const { idPonto, tipo, ordem, ativo } = addPontoRotaDto;

    // Validar rota
    const rota = await this.rotaRepository.findOne({ where: { id: idRota } });
    if (!rota) {
      throw new NotFoundException('Rota não encontrada');
    }

    // Validar ponto
    const ponto = await this.pontoRepository.findOne({
      where: { id: idPonto },
    });
    if (!ponto) {
      throw new NotFoundException('Ponto não encontrado');
    }

    // Verificar se já existe
    const existingRotaPonto = await this.rotaPontoRepository.findOne({
      where: { idRota, idPonto, tipo },
    });

    if (existingRotaPonto) {
      throw new BadRequestException(
        `Este ponto já está cadastrado como ${tipo} nesta rota`,
      );
    }

    const rotaPonto = this.rotaPontoRepository.create({
      idRota,
      idPonto,
      tipo,
      ordem,
      ativo: ativo !== undefined ? ativo : true,
    });

    return await this.rotaPontoRepository.save(rotaPonto);
  }

  async removePontoFromRota(idRotaPonto: number): Promise<void> {
    const rotaPonto = await this.rotaPontoRepository.findOne({
      where: { id: idRotaPonto },
    });

    if (!rotaPonto) {
      throw new NotFoundException('Associação não encontrada');
    }

    await this.rotaPontoRepository.remove(rotaPonto);
  }

  async updatePontoRota(
    idRotaPonto: number,
    updatePontoRotaDto: UpdatePontoRotaDto,
  ): Promise<RotaPonto> {
    const rotaPonto = await this.rotaPontoRepository.findOne({
      where: { id: idRotaPonto },
    });

    if (!rotaPonto) {
      throw new NotFoundException('Associação não encontrada');
    }

    Object.assign(rotaPonto, updatePontoRotaDto);
    return await this.rotaPontoRepository.save(rotaPonto);
  }

  // Buscar passageiros da rota
  async getPassageirosRota(
    getPassageirosRotaDto: GetPassageirosRotaDto,
  ): Promise<any> {
    const { idRota, tipo } = getPassageirosRotaDto;

    // Validar rota
    const rota = await this.rotaRepository.findOne({
      where: { id: idRota },
    });

    if (!rota) {
      throw new NotFoundException('Rota não encontrada');
    }

    const hoje = new Date().toISOString().split('T')[0];

    // Buscar pontos da rota
    const whereClausePontos: any = { idRota };
    if (tipo) {
      whereClausePontos.tipo = tipo;
    }

    const pontosRota = await this.rotaPontoRepository.find({
      where: whereClausePontos,
      relations: ['ponto'],
      order: { ordem: 'ASC' },
    });

    // Buscar alunos vinculados à empresa
    const alunosVinculados = await this.empresaAlunoRepository.find({
      where: {
        empresaId: rota.idEmpresa,
        ativo: true,
      },
      select: ['alunoId'],
    });

    const idsAlunosVinculados = alunosVinculados.map((v) => v.alunoId);

    if (idsAlunosVinculados.length === 0) {
      return {
        rota: {
          id: rota.id,
          nome: rota.nome,
        },
        tipo: tipo || 'todos',
        data: hoje,
        pontosComPassageiros: [],
        totalPontos: 0,
        totalPassageiros: 0,
      };
    }

    // Buscar passageiros do dia (aceita embarque OU desembarque)
    const passageirosHoje = await this.alunoRepository
      .createQueryBuilder('aluno')
      .leftJoinAndSelect('aluno.pontoEmbarqueObj', 'pontoEmbarque')
      .leftJoinAndSelect('aluno.pontoDesembarqueObj', 'pontoDesembarque')
      .where('aluno.id IN (:...ids)', { ids: idsAlunosVinculados })
      .andWhere(
        '(aluno.pontoEmbarque IS NOT NULL OR aluno.pontoDesembarque IS NOT NULL)',
      )
      .getMany();

    // Registrar em RotaPassageiro se ainda não existe
    for (const aluno of passageirosHoje) {
      const registroExistente = await this.rotaPassageiroRepository.findOne({
        where: {
          idRota,
          idAluno: aluno.id,
          dataEscolha: hoje as any,
        },
      });

      if (!registroExistente) {
        await this.rotaPassageiroRepository.save({
          idRota,
          idAluno: aluno.id,
          pontoEmbarque: aluno.pontoEmbarque,
          pontoDesembarque: aluno.pontoDesembarque,
          dataEscolha: hoje as any,
          ativo: true,
        });
      }
    }

    // Agrupar passageiros por ponto
    const passageirosPorPonto = pontosRota.map((rotaPonto) => {
      const pontoId = rotaPonto.ponto.id;
      const tipoPonto = rotaPonto.tipo;

      const passageiros = passageirosHoje
        .filter((passageiro) => {
          if (tipoPonto === 'embarque') {
            return passageiro.pontoEmbarque === pontoId;
          } else if (tipoPonto === 'desembarque') {
            return passageiro.pontoDesembarque === pontoId;
          }
          return false;
        })
        .map((passageiro) => ({
          id: passageiro.id,
          nome: passageiro.nome,
          email: passageiro.email,
          pontoEmbarque: {
            id: passageiro.pontoEmbarqueObj?.id,
            nome: passageiro.pontoEmbarqueObj?.nome,
          },
          pontoDesembarque: {
            id: passageiro.pontoDesembarqueObj?.id,
            nome: passageiro.pontoDesembarqueObj?.nome,
          },
        }));

      return {
        ponto: {
          id: rotaPonto.ponto.id,
          nome: rotaPonto.ponto.nome,
          endereco: rotaPonto.ponto.endereco,
          ordem: rotaPonto.ordem,
          tipo: rotaPonto.tipo,
        },
        passageiros,
        totalPassageiros: passageiros.length,
      };
    });

    const totalPassageiros = passageirosPorPonto.reduce(
      (total, ponto) => total + ponto.totalPassageiros,
      0,
    );

    return {
      rota: {
        id: rota.id,
        nome: rota.nome,
      },
      tipo: tipo || 'todos',
      data: hoje,
      pontosComPassageiros: passageirosPorPonto,
      totalPontos: passageirosPorPonto.length,
      totalPassageiros,
    };
  }
}
