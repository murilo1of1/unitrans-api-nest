import { IsOptional, IsString } from 'class-validator';

export class UpdateRotaDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  nome?: string;

  @IsOptional()
  @IsString({ message: 'Origem deve ser uma string' })
  origem?: string;

  @IsOptional()
  @IsString({ message: 'Destino deve ser uma string' })
  destino?: string;
}
