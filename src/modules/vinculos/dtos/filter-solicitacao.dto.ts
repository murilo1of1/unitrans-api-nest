import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { StatusSolicitacao } from '../entities/solicitacao-vinculo.entity';

export class FilterSolicitacaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId?: number;

  @IsOptional()
  @IsEnum(StatusSolicitacao, {
    message: 'Status deve ser pendente, aprovado ou rejeitado',
  })
  status?: StatusSolicitacao;
}
