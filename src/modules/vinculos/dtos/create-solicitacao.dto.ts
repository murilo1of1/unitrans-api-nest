import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateSolicitacaoDto {
  @IsNotEmpty({ message: 'ID do aluno é obrigatório' })
  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId: number;

  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId: number;
}
