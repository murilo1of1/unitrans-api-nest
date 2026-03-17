import { Controller, Post, Body, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { PagamentosService } from './pagamentos.service';
import { CreatePixDto } from './dtos/create-pix.dto';
import { verifyAbacateSignature } from './utils/verify-webhook.util';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('pix')
  async criarPix(@Body() createPixDto: CreatePixDto) {
    return this.pagamentosService.criarPix(createPixDto);
  }

  @Post('pix/simular/:id')
  async simularPagamentoPix(@Param('id') id: string) {
    return this.pagamentosService.simularPagamento(id);
  }

  @Post('webhook')
  async receberWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const isValid = verifyAbacateSignature(req);

      if (!isValid) {
        throw new UnauthorizedException('Assinatura de Webhook invalida.');
      }

      const payload = req.body;
      const evento = payload.event;
      const dados = payload.data;

      // Eventos são nomeados um pouco diferente na v1 (billing.paid)
      switch (evento) {
        case 'billing.paid':
          console.log(`Pagamento PIX/Cobrança Confirmado. ID da Cobranca: ${dados?.id}`);
          console.log(`Dados do Pagamento:`, dados);
          break;

        case 'billing.created':
          console.log(`Nova cobrancaa criada.`, dados?.id);
          break;

        default:
          console.log(`Evento ${evento} recebido mas nao tratado.`);
          break;
      }

      return res.status(200).send({ success: true });
    } catch (error) {
      console.error('Erro ao processar o webhook', error);
      return res.status(400).send({ error: 'Erro no processamento do webhook' });
    }
  }
}

