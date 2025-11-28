import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateVinculoDto {
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId: number;

  @IsInt({ message: 'ID do aluno deve ser um número inteiro' })
  alunoId: number;

  @IsEnum(['token', 'solicitacao', 'manual'], {
    message: 'Origem do vínculo deve ser token, solicitacao ou manual',
  })
  origemVinculo: 'token' | 'solicitacao' | 'manual';

  @IsString({ message: 'Vinculado por deve ser uma string' })
  vinculadoPor: string;
}
