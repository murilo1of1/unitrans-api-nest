import { IsOptional, IsString } from 'class-validator';

export class RejeitarSolicitacaoDto {
  @IsOptional()
  @IsString({ message: 'Motivo de rejeição deve ser uma string' })
  motivoRejeicao?: string;
}
