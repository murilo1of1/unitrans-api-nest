import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateRotaDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  nome: string;

  @IsNotEmpty({ message: 'Origem é obrigatória' })
  @IsString({ message: 'Origem deve ser uma string' })
  origem: string;

  @IsNotEmpty({ message: 'Destino é obrigatório' })
  @IsString({ message: 'Destino deve ser uma string' })
  destino: string;

  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  idEmpresa: number;
}
