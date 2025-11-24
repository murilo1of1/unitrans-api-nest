import { IsEnum, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPassageirosRotaDto {
  @IsNotEmpty({ message: 'ID da rota é obrigatório' })
  @IsInt({ message: 'ID da rota deve ser um número inteiro' })
  @Type(() => Number)
  idRota: number;

  @IsOptional()
  @IsEnum(['embarque', 'desembarque'], {
    message: 'Tipo deve ser "embarque" ou "desembarque"',
  })
  tipo?: 'embarque' | 'desembarque';
}
