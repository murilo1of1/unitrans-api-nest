import { IsOptional, IsBoolean, IsEnum, IsInt } from 'class-validator';

export class FilterVinculoDto {
  @IsOptional()
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId?: number;

  @IsOptional()
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId?: number;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;
}
