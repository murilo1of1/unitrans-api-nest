import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SalvarEscolhasPontosDto {
  @IsNumber({}, { message: 'ID do aluno deve ser um número' })
  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  idAluno: number;

  @IsNumber({}, { message: 'ID da rota deve ser um número' })
  @IsNotEmpty({ message: 'ID da rota é obrigatório' })
  idRota: number;

  @IsOptional()
  @IsNumber({}, { message: 'Ponto de embarque deve ser um número' })
  pontoEmbarque?: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'Ponto de desembarque deve ser um número' })
  pontoDesembarque?: number | null;
}
