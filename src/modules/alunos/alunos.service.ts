import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from './entities/aluno.entity';
import { Ponto } from '../pontos/entities/ponto.entity';
import { Rota } from '../rotas/entities/rota.entity';
import { RotaPassageiro } from '../rotas/entities/rota-passageiro.entity';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import { CreateAlunoDto } from './dtos/create-aluno.dto';
import { UpdateAlunoDto } from './dtos/update-aluno.dto';
import { SalvarEscolhasPontosDto } from './dtos/salvar-escolhas-pontos.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlunosService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunosRepository: Repository<Aluno>,
    @InjectRepository(Ponto)
    private readonly pontosRepository: Repository<Ponto>,
    @InjectRepository(Rota)
    private readonly rotasRepository: Repository<Rota>,
    @InjectRepository(RotaPassageiro)
    private readonly rotaPassageiroRepository: Repository<RotaPassageiro>,
    @InjectRepository(EmpresaAluno)
    private readonly empresaAlunoRepository: Repository<EmpresaAluno>,
  ) {}

  async findAll() {
    return this.alunosRepository.find({
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const aluno = await this.alunosRepository.findOne({
      where: { id },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return aluno;
  }

  async create(createAlunoDto: CreateAlunoDto) {
    // Verificar se email já existe
    const alunoExistenteEmail = await this.alunosRepository.findOne({
      where: { email: createAlunoDto.email },
    });

    if (alunoExistenteEmail) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Verificar se CPF já existe
    const alunoExistenteCpf = await this.alunosRepository.findOne({
      where: { cpf: createAlunoDto.cpf },
    });

    if (alunoExistenteCpf) {
      throw new BadRequestException('CPF já cadastrado');
    }

    const data: any = { ...createAlunoDto };

    if (data.senha) {
      data.passwordHash = await bcrypt.hash(data.senha, 10);
      delete data.senha;
    }

    const aluno = this.alunosRepository.create(data);
    const result: any = await this.alunosRepository.save(aluno);

    return this.alunosRepository.findOne({
      where: { id: result.id },
    });
  }

  async update(id: number, updateAlunoDto: UpdateAlunoDto) {
    const aluno = await this.alunosRepository.findOne({ where: { id } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const data: any = { ...updateAlunoDto };

    if (data.senha) {
      data.passwordHash = await bcrypt.hash(data.senha, 10);
      delete data.senha;
    }

    await this.alunosRepository.update(id, data);

    return this.alunosRepository.findOne({
      where: { id },
    });
  }

  async delete(id: number) {
    const aluno = await this.alunosRepository.findOne({ where: { id } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const alunoData = { ...aluno };
    await this.alunosRepository.remove(aluno);

    return {
      id: alunoData.id,
      nome: alunoData.nome,
      email: alunoData.email,
      cpf: alunoData.cpf,
    };
  }

  async salvarEscolhasPontos(dto: SalvarEscolhasPontosDto) {
    const { idAluno, idRota, pontoEmbarque, pontoDesembarque } = dto;

    const aluno = await this.alunosRepository.findOne({
      where: { id: idAluno },
    });
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const rota = await this.rotasRepository.findOne({
      where: { id: idRota },
    });
    if (!rota) {
      throw new NotFoundException('Rota não encontrada');
    }

    const vinculo = await this.empresaAlunoRepository.findOne({
      where: {
        alunoId: idAluno,
        empresaId: rota.idEmpresa,
        ativo: true,
      },
    });

    if (!vinculo) {
      throw new ForbiddenException(
        'Aluno não está vinculado à empresa desta rota',
      );
    }

    // Validar pontos apenas se foram fornecidos (não são null)
    let pontoEmb: Ponto | null = null;
    let pontoDes: Ponto | null = null;

    if (pontoEmbarque !== null && pontoEmbarque !== undefined) {
      pontoEmb = await this.pontosRepository.findOne({
        where: { id: pontoEmbarque },
      });
      if (!pontoEmb) {
        throw new NotFoundException('Ponto de embarque não encontrado');
      }
    }

    if (pontoDesembarque !== null && pontoDesembarque !== undefined) {
      pontoDes = await this.pontosRepository.findOne({
        where: { id: pontoDesembarque },
      });
      if (!pontoDes) {
        throw new NotFoundException('Ponto de desembarque não encontrado');
      }
    }

    const hojeStr = new Date().toISOString().split('T')[0];
    const hoje = new Date(hojeStr); // normalize to a Date object (YYYY-MM-DD -> UTC midnight)

    const registroExistente = await this.rotaPassageiroRepository.findOne({
      where: {
        idRota,
        idAluno,
        dataEscolha: hoje,
      },
    });

    if (registroExistente) {
      await this.rotaPassageiroRepository.update(
        { id: registroExistente.id },
        {
          pontoEmbarque,
          pontoDesembarque,
          ativo: true,
        },
      );
    } else {
      const novoRegistro = this.rotaPassageiroRepository.create({
        idRota,
        idAluno,
        pontoEmbarque,
        pontoDesembarque,
        dataEscolha: hoje,
        ativo: true,
      });
      await this.rotaPassageiroRepository.save(novoRegistro);
    }

    return {
      message: 'Escolhas salvas com sucesso',
      data: {
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          pontoEmbarque: pontoEmb?.nome || 'Não vai embarcar',
          pontoDesembarque: pontoDes?.nome || 'Não vai desembarcar',
        },
      },
    };
  }
}
