import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString({ message: 'CNPJ deve ser uma string' })
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  cnpj: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  senha: string;

  @IsString({ message: 'Token deve ser uma string' })
  @IsOptional()
  token?: string;

  @IsEnum(['ambos', 'token', 'pesquisa'], {
    message: 'Tipo de vínculo inválido',
  })
  @IsOptional()
  tipoVinculo?: 'ambos' | 'token' | 'pesquisa';
}
