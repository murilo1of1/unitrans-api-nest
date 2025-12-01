import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmpresaAluno } from '../empresas/entities/empresa-aluno.entity';
import {
  SolicitacaoVinculo,
  StatusSolicitacao,
} from './entities/solicitacao-vinculo.entity';
import { TokenAcesso } from './entities/token-acesso.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Aluno } from '../alunos/entities/aluno.entity';
import { CreateVinculoDto } from './dtos/create-vinculo.dto';
import { FilterVinculoDto } from './dtos/filter-vinculo.dto';
import { GerarTokenDto } from './dtos/gerar-token.dto';
import { VincularPorTokenDto } from './dtos/vincular-por-token.dto';
import { CreateSolicitacaoDto } from './dtos/create-solicitacao.dto';
import { RejeitarSolicitacaoDto } from './dtos/rejeitar-solicitacao.dto';
import { FilterSolicitacaoDto } from './dtos/filter-solicitacao.dto';

@Injectable()
export class VinculosService {
  constructor(
    @InjectRepository(EmpresaAluno)
    private empresaAlunoRepository: Repository<EmpresaAluno>,
    @InjectRepository(SolicitacaoVinculo)
    private solicitacaoVinculoRepository: Repository<SolicitacaoVinculo>,
    @InjectRepository(TokenAcesso)
    private tokenAcessoRepository: Repository<TokenAcesso>,
    @InjectRepository(Empresa)
    private empresaRepository: Repository<Empresa>,
    @InjectRepository(Aluno)
    private alunoRepository: Repository<Aluno>,
  ) {}

  // ==================== VÍNCULOS ====================

  async criarVinculo(
    createVinculoDto: CreateVinculoDto,
  ): Promise<EmpresaAluno> {
    const { empresaId, alunoId, origemVinculo, vinculadoPor } =
      createVinculoDto;

    // Verificar se já existe vínculo ativo
    const vinculoExistente = await this.empresaAlunoRepository.findOne({
      where: { empresaId, alunoId, ativo: true },
    });

    if (vinculoExistente) {
      throw new BadRequestException(
        'Vínculo já existe entre este aluno e empresa',
      );
    }

    const vinculo = this.empresaAlunoRepository.create({
      empresaId,
      alunoId,
      origemVinculo,
      vinculadoPor,
    });

    const vinculoSalvo = await this.empresaAlunoRepository.save(vinculo);

    const vinculoComRelacoes = await this.empresaAlunoRepository.findOne({
      where: { id: vinculoSalvo.id },
      relations: ['empresa', 'aluno'],
    });
    if (!vinculoComRelacoes) {
      throw new NotFoundException('Vínculo criado mas não encontrado');
    }
    return vinculoComRelacoes;
  }

  async listarVinculos(filterDto: FilterVinculoDto): Promise<EmpresaAluno[]> {
    const { alunoId, empresaId, ativo } = filterDto;

    const where: any = {};
    if (alunoId) where.alunoId = alunoId;
    if (empresaId) where.empresaId = empresaId;
    if (ativo !== undefined) where.ativo = ativo;

    return await this.empresaAlunoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { dataVinculo: 'DESC' },
    });
  }

  async listarVinculosAluno(
    idAluno: number,
    ativo?: boolean,
  ): Promise<EmpresaAluno[]> {
    const where: any = { alunoId: idAluno };
    if (ativo !== undefined) where.ativo = ativo;

    return await this.empresaAlunoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { dataVinculo: 'DESC' },
    });
  }

  async listarVinculosEmpresa(
    idEmpresa: number,
    ativo?: boolean,
  ): Promise<EmpresaAluno[]> {
    const where: any = { empresaId: idEmpresa };
    if (ativo !== undefined) where.ativo = ativo;

    return await this.empresaAlunoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { dataVinculo: 'DESC' },
    });
  }

  async desativarVinculo(id: number): Promise<void> {
    const vinculo = await this.empresaAlunoRepository.findOne({
      where: { id },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    vinculo.ativo = false;
    vinculo.dataDesvinculo = new Date();

    await this.empresaAlunoRepository.save(vinculo);
  }

  async reativarVinculo(id: number): Promise<void> {
    const vinculo = await this.empresaAlunoRepository.findOne({
      where: { id },
    });

    if (!vinculo) {
      throw new NotFoundException('Vínculo não encontrado');
    }

    vinculo.ativo = true;
    vinculo.dataDesvinculo = null;

    await this.empresaAlunoRepository.save(vinculo);
  }

  // ==================== TOKENS ====================

  async gerarToken(
    gerarTokenDto: GerarTokenDto,
  ): Promise<{ token: string; expiraEm: Date; empresa: string }> {
    const { empresaId } = gerarTokenDto;

    const empresa = await this.empresaRepository.findOne({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Gerar token de 8 caracteres (4 bytes em hex)
    const tokenPlain = crypto.randomBytes(4).toString('hex').toUpperCase();
    const tokenHash = await bcrypt.hash(tokenPlain, 10);

    // Token expira em 30 minutos
    const dataExpiracao = new Date();
    dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);

    const tokenAcesso = this.tokenAcessoRepository.create({
      token: tokenHash,
      idEmpresa: empresaId,
      dataExpiracao,
    });

    const tokenSalvo = await this.tokenAcessoRepository.save(tokenAcesso);

    return {
      token: tokenPlain, // Retorna o token em texto plano (única vez)
      expiraEm: tokenSalvo.dataExpiracao,
      empresa: empresa.nome,
    };
  }

  async listarTokens(empresaId?: number): Promise<TokenAcesso[]> {
    const where: any = {};
    if (empresaId) where.idEmpresa = empresaId;

    return await this.tokenAcessoRepository.find({
      where,
      relations: ['empresa'],
      order: { createdAt: 'DESC' },
    });
  }

  async listarTokensEmpresa(idEmpresa: number): Promise<TokenAcesso[]> {
    return await this.tokenAcessoRepository.find({
      where: { idEmpresa },
      relations: ['empresa'],
      order: { createdAt: 'DESC' },
    });
  }

  async revogarToken(id: number): Promise<void> {
    const token = await this.tokenAcessoRepository.findOne({ where: { id } });

    if (!token) {
      throw new NotFoundException('Token não encontrado');
    }

    token.ativo = false;
    await this.tokenAcessoRepository.save(token);
  }

  async vincularPorToken(
    vincularPorTokenDto: VincularPorTokenDto,
  ): Promise<EmpresaAluno> {
    const { token, alunoId } = vincularPorTokenDto;

    // Buscar todos os tokens ativos
    const tokensAtivos = await this.tokenAcessoRepository.find({
      where: { ativo: true },
      relations: ['empresa'],
    });

    // Encontrar o token que corresponde ao hash
    let tokenAcesso: TokenAcesso | null = null;
    for (const t of tokensAtivos) {
      try {
        if (!t.token) continue; // Pular se token for null/undefined
        const isValid = await bcrypt.compare(token, t.token);
        if (isValid) {
          tokenAcesso = t;
          break;
        }
      } catch (error) {
        // Token hash inválido no banco, continuar para próximo
        console.error(`Erro ao comparar token ID ${t.id}:`, error.message);
        continue;
      }
    }

    if (!tokenAcesso) {
      throw new BadRequestException('Token inválido ou inativo');
    }

    // Validar expiração
    if (new Date() > tokenAcesso.dataExpiracao) {
      throw new BadRequestException('Token expirado');
    }

    // Validar uso único
    if (tokenAcesso.usoUnico && tokenAcesso.usado) {
      throw new BadRequestException('Token já foi utilizado');
    }

    // Verificar se já existe vínculo
    const vinculoExistente = await this.empresaAlunoRepository.findOne({
      where: {
        empresaId: tokenAcesso.idEmpresa,
        alunoId,
        ativo: true,
      },
    });

    if (vinculoExistente) {
      throw new BadRequestException(
        'Vínculo já existe entre este aluno e empresa',
      );
    }

    // Criar vínculo
    const vinculo = this.empresaAlunoRepository.create({
      empresaId: tokenAcesso.idEmpresa,
      alunoId,
      origemVinculo: 'token',
      vinculadoPor: tokenAcesso.id.toString(),
    });

    const vinculoSalvo = await this.empresaAlunoRepository.save(vinculo);

    // Marcar token como usado
    tokenAcesso.usado = true;
    tokenAcesso.usadoEm = new Date();
    tokenAcesso.usadoPor = alunoId;
    await this.tokenAcessoRepository.save(tokenAcesso);

    const vinculoComRelacoes = await this.empresaAlunoRepository.findOne({
      where: { id: vinculoSalvo.id },
      relations: ['empresa', 'aluno'],
    });
    if (!vinculoComRelacoes) {
      throw new NotFoundException('Vínculo criado mas não encontrado');
    }
    return vinculoComRelacoes;
  }

  // ==================== SOLICITAÇÕES ====================

  async solicitarVinculo(
    createSolicitacaoDto: CreateSolicitacaoDto,
  ): Promise<SolicitacaoVinculo> {
    const { alunoId, empresaId } = createSolicitacaoDto;

    // Validar empresa
    const empresa = await this.empresaRepository.findOne({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se já existe vínculo
    const vinculoExistente = await this.empresaAlunoRepository.findOne({
      where: { empresaId, alunoId, ativo: true },
    });

    if (vinculoExistente) {
      throw new BadRequestException(
        'Vínculo já existe entre este aluno e empresa',
      );
    }

    // Verificar se já existe solicitação pendente
    const solicitacaoExistente =
      await this.solicitacaoVinculoRepository.findOne({
        where: {
          idEmpresa: empresaId,
          idAluno: alunoId,
          status: StatusSolicitacao.PENDENTE,
        },
      });

    if (solicitacaoExistente) {
      throw new BadRequestException(
        'Já existe uma solicitação pendente para esta empresa',
      );
    }

    const solicitacao = this.solicitacaoVinculoRepository.create({
      idAluno: alunoId,
      idEmpresa: empresaId,
    });

    const solicitacaoSalva =
      await this.solicitacaoVinculoRepository.save(solicitacao);

    const solicitacaoComRelacoes =
      await this.solicitacaoVinculoRepository.findOne({
        where: { id: solicitacaoSalva.id },
        relations: ['empresa', 'aluno'],
      });
    if (!solicitacaoComRelacoes) {
      throw new NotFoundException('Solicitação criada mas não encontrada');
    }
    return solicitacaoComRelacoes;
  }

  async listarSolicitacoes(
    filterDto: FilterSolicitacaoDto,
  ): Promise<SolicitacaoVinculo[]> {
    const { empresaId, alunoId, status } = filterDto;

    const where: any = {};
    if (empresaId) where.idEmpresa = empresaId;
    if (alunoId) where.idAluno = alunoId;
    if (status) where.status = status;

    return await this.solicitacaoVinculoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { solicitadoEm: 'DESC' },
    });
  }

  async listarSolicitacoesEmpresa(
    idEmpresa: number,
    status?: StatusSolicitacao,
  ): Promise<SolicitacaoVinculo[]> {
    const where: any = { idEmpresa };
    if (status) where.status = status;

    return await this.solicitacaoVinculoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { solicitadoEm: 'DESC' },
    });
  }

  async listarSolicitacoesAluno(
    idAluno: number,
    status?: StatusSolicitacao,
  ): Promise<SolicitacaoVinculo[]> {
    const where: any = { idAluno };
    if (status) where.status = status;

    return await this.solicitacaoVinculoRepository.find({
      where,
      relations: ['empresa', 'aluno'],
      order: { solicitadoEm: 'DESC' },
    });
  }

  async aprovarSolicitacao(id: number): Promise<EmpresaAluno> {
    const solicitacao = await this.solicitacaoVinculoRepository.findOne({
      where: { id },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new BadRequestException('Solicitação já foi respondida');
    }

    // Verificar se já existe vínculo ativo
    const vinculoExistente = await this.empresaAlunoRepository.findOne({
      where: {
        empresaId: solicitacao.idEmpresa,
        alunoId: solicitacao.idAluno,
        ativo: true,
      },
    });

    if (vinculoExistente) {
      throw new BadRequestException(
        'Vínculo já existe entre este aluno e empresa',
      );
    }

    // Atualizar solicitação
    solicitacao.status = StatusSolicitacao.APROVADO;
    solicitacao.respondidoEm = new Date();
    await this.solicitacaoVinculoRepository.save(solicitacao);

    // Criar vínculo
    const vinculo = this.empresaAlunoRepository.create({
      empresaId: solicitacao.idEmpresa,
      alunoId: solicitacao.idAluno,
      origemVinculo: 'solicitacao',
      vinculadoPor: id.toString(),
    });

    const vinculoSalvo = await this.empresaAlunoRepository.save(vinculo);

    const vinculoComRelacoes = await this.empresaAlunoRepository.findOne({
      where: { id: vinculoSalvo.id },
      relations: ['empresa', 'aluno'],
    });
    if (!vinculoComRelacoes) {
      throw new NotFoundException('Vínculo criado mas não encontrado');
    }
    return vinculoComRelacoes;
  }

  async rejeitarSolicitacao(
    id: number,
    rejeitarDto: RejeitarSolicitacaoDto,
  ): Promise<void> {
    const solicitacao = await this.solicitacaoVinculoRepository.findOne({
      where: { id },
    });

    if (!solicitacao) {
      throw new NotFoundException('Solicitação não encontrada');
    }

    if (solicitacao.status !== StatusSolicitacao.PENDENTE) {
      throw new BadRequestException('Solicitação já foi respondida');
    }

    solicitacao.status = StatusSolicitacao.REJEITADO;
    solicitacao.respondidoEm = new Date();
    solicitacao.motivoRejeicao = rejeitarDto.motivoRejeicao || null;

    await this.solicitacaoVinculoRepository.save(solicitacao);
  }
}
