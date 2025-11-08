import { IsNotEmpty, IsNumber } from 'class-validator';

export class SalvarEscolhasPontosDto {
  @IsNumber({}, { message: 'ID do aluno deve ser um número' })
  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  idAluno: number;

  @IsNumber({}, { message: 'ID da rota deve ser um número' })
  @IsNotEmpty({ message: 'ID da rota é obrigatório' })
  idRota: number;

  @IsNumber({}, { message: 'Ponto de embarque deve ser um número' })
  @IsNotEmpty({ message: 'Ponto de embarque é obrigatório' })
  pontoEmbarque: number;

  @IsNumber({}, { message: 'Ponto de desembarque deve ser um número' })
  @IsNotEmpty({ message: 'Ponto de desembarque é obrigatório' })
  pontoDesembarque: number;
}
