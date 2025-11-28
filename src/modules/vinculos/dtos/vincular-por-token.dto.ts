import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class VincularPorTokenDto {
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token deve ser uma string' })
  token: string;

  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId: number;
}
