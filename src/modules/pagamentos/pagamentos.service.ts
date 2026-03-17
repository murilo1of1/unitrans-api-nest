import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePixDto } from './dtos/create-pix.dto';

@Injectable()
export class PagamentosService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    // Voltando para V1 (que é a versão suportada pela key no .env do usuário)
    this.apiUrl = process.env.ABACATE_PAY_API_URL || 'https://api.abacatepay.com/v1';
    this.apiKey = process.env.ABACATE_PAY || '';
  }

  async criarPix(createPixDto: CreatePixDto) {
    try {
      const response = await fetch(`${this.apiUrl}/pixQrCode/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          amount: createPixDto.amount,
          description: createPixDto.description,
          customer: createPixDto.customer,
        }),
      });

      const data = await response.json();

      // Na v1, a resposta de sucesso nem sempre tem 'success: true', ela devolve apenas { data: {}, error: null }
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
      // Diferente da v2 (query params), na v1 é possível passar no body ou não precisa. Mas vamos seguir a docs que enviou simulando v1 de fato, a rota é `/pixQrCode/simulate-payment?id=` (na documentação diz "query parameters" id string required)
      const response = await fetch(`${this.apiUrl}/pixQrCode/simulate-payment?id=${idStr}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          metadata: { simulatedVia: 'unitrans-api' }
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Erro ao simular pagamento no AbacatePay');
      }

      return data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
