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

    // Data no formato string YYYY-MM-DD (mesma lógica da API Express)
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

    // Buscar registros de passageiros do dia na tabela rota_passageiros
    const registrosPassageiros = await this.rotaPassageiroRepository.find({
      where: {
        idRota,
        ativo: true,
      },
    });

    // Filtrar por data manualmente (comparação apenas de data, sem hora)
    const registrosDoDia = registrosPassageiros.filter((r) => {
      const dataRegistro = new Date(r.dataEscolha).toISOString().split('T')[0];
      return dataRegistro === hoje;
    });

    // Buscar dados completos dos alunos
    const idsAlunosComEscolha = registrosDoDia.map((rp) => rp.idAluno);

    const alunosComDados = await this.alunoRepository.find({
      where:
        idsAlunosComEscolha.length > 0
          ? idsAlunosComEscolha.map((id) => ({ id }))
          : [],
    });

    // Criar mapa de alunos para acesso rápido
    const alunosMap = new Map(alunosComDados.map((a) => [a.id, a]));

    // Agrupar passageiros por ponto
    const passageirosPorPonto = pontosRota.map((rotaPonto) => {
      const pontoId = rotaPonto.ponto.id;
      const tipoPonto = rotaPonto.tipo;

      const passageiros = registrosDoDia
        .filter((registro) => {
          if (tipoPonto === 'embarque') {
            return registro.pontoEmbarque === pontoId;
          } else if (tipoPonto === 'desembarque') {
            return registro.pontoDesembarque === pontoId;
          }
          return false;
        })
        .map((registro) => {
          const aluno = alunosMap.get(registro.idAluno);
          return {
            id: aluno?.id || registro.idAluno,
            nome: aluno?.nome || 'Desconhecido',
            email: aluno?.email || '',
            pontoEmbarque: {
              id: registro.pontoEmbarque,
              nome: registro.pontoEmbarque
                ? `Ponto ${registro.pontoEmbarque}`
                : null,
            },
            pontoDesembarque: {
              id: registro.pontoDesembarque,
              nome: registro.pontoDesembarque
                ? `Ponto ${registro.pontoDesembarque}`
                : null,
            },
          };
        });

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
