import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
} from 'class-validator';

export class CreateAlunoDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'CPF deve ser uma string' })
  @IsOptional()
  cpf?: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsOptional()
  senha?: string;

  @IsString({ message: 'Token deve ser uma string' })
  @IsOptional()
  token?: string;

  @IsNumber({}, { message: 'ID da empresa deve ser um número' })
  @IsOptional()
  idEmpresa?: number;

  @IsNumber({}, { message: 'ID do plano deve ser um número' })
  @IsOptional()
  idPlano?: number;

  @IsNumber({}, { message: 'Ponto de embarque deve ser um número' })
  @IsOptional()
  pontoEmbarque?: number;

  @IsNumber({}, { message: 'Ponto de desembarque deve ser um número' })
  @IsOptional()
  pontoDesembarque?: number;
}
