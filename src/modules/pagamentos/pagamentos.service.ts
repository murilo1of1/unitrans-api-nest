import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePixDto } from './dtos/create-pix.dto';
import { CreateFaturaDto } from './dtos/create-fatura.dto';
import { FaturaAluno } from './entities/fatura-aluno.entity';

@Injectable()
export class PagamentosService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    @InjectRepository(FaturaAluno)
    private readonly faturaAlunoRepository: Repository<FaturaAluno>,
  ) {
    this.apiUrl =
      process.env.ABACATE_PAY_API_URL || 'https://api.abacatepay.com/v1';
    this.apiKey = process.env.ABACATE_PAY || '';
  }

  async criarPix(createPixDto: CreatePixDto) {
    try {
      const response = await fetch(`${this.apiUrl}/pixQrCode/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: createPixDto.amount,
          description: createPixDto.description,
          customer: createPixDto.customer,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao criar QRCode Pix no AbacatePay');
      }

      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async simularPagamento(idStr: string) {
    try {
      const response = await fetch(
        `${this.apiUrl}/pixQrCode/simulate-payment?id=${idStr}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            metadata: { simulatedVia: 'unitrans-api' },
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(
          data.error || 'Erro ao simular pagamento no AbacatePay',
        );
      }

      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListagemPagamentos() {
    try {
      const response = await fetch(`${this.apiUrl}/billing/list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(
          data.error || 'Erro ao listar pagamentos no AbacatePay',
        );
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // --- NOVA LÓGICA DE FATURAS ---

  async criarFatura(dto: CreateFaturaDto) {
    // 1. Gera código de suporte amigável
    const codigoSuporte = `PAY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let vencimento = new Date();
    if (dto.dataVencimento) {
      vencimento = new Date(dto.dataVencimento);
    } else {
      // +5 dias por default
      vencimento.setDate(vencimento.getDate() + 5);
    }

    // 2. Chama a Abacate Pay para criar a cobrança no gateway
    const amountInCents = Math.round(dto.valor * 100);
    const pixData = await this.criarPix({
      amount: amountInCents,
      description: `Mensalidade ${dto.mes_referencia || 'Unitrans'} - Suporte: ${codigoSuporte}`,
    });

    const abacatePayId = pixData.data?.id;

    // 3. Salva no banco de dados local
    const novaFatura = this.faturaAlunoRepository.create({
      alunoId: dto.alunoId,
      empresaId: dto.empresaId,
      planoId: dto.planoId || null,
      valor: dto.valor,
      dataVencimento: vencimento,
      mes_referencia: dto.mes_referencia,
      abacatePayId: abacatePayId,
      codigoSuportePagamento: codigoSuporte,
      pixCopiaCola: pixData.data?.brCode || null,
      qrCodeBase64: pixData.data?.qrCode || null,
      status: 'PENDENTE',
    });

    const faturaSalva = await this.faturaAlunoRepository.save(novaFatura);

    // Retorna a fatura com o payload do abacate pay para o front já renderizar o QR code
    return {
      fatura: faturaSalva,
      pix: pixData,
    };
  }

  async buscarFaturasPorAluno(alunoId: number) {
    return this.faturaAlunoRepository.find({
      where: { alunoId },
      order: { createdAt: 'DESC' },
      relations: ['empresa', 'plano'], // Para o aluno ver quem está cobrando
    });
  }

  async buscarFaturasPorEmpresa(empresaId: number) {
    return this.faturaAlunoRepository.find({
      where: { empresaId },
      order: { createdAt: 'DESC' },
      relations: ['aluno', 'plano'], // Para a empresa ver quem foi cobrado
    });
  }

  async marcarFaturaComoPaga(abacatePayId: string) {
    const fatura = await this.faturaAlunoRepository.findOne({
      where: { abacatePayId },
    });
    if (fatura) {
      fatura.status = 'PAGA';
      fatura.dataPagamento = new Date();
      await this.faturaAlunoRepository.save(fatura);
    }
  }
}
