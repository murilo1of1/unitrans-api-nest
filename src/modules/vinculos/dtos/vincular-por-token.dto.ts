import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class VincularPorTokenDto {
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString({ message: 'Token deve ser uma string' })
  token: string;

  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  @Type(() => Number)
  alunoId: number;
}
