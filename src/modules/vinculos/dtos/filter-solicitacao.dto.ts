import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { StatusSolicitacao } from '../entities/solicitacao-vinculo.entity';

export class FilterSolicitacaoDto {
  @IsOptional()
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId?: number;

  @IsOptional()
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId?: number;

  @IsOptional()
  @IsEnum(StatusSolicitacao, {
    message: 'Status deve ser pendente, aprovado ou rejeitado',
  })
  status?: StatusSolicitacao;
}
