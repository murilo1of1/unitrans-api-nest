import { IsOptional, IsBoolean, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterVinculoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
