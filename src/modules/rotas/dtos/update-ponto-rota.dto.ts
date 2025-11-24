import { IsOptional, IsInt, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePontoRotaDto {
  @IsOptional()
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Type(() => Number)
  ordem?: number;

  @IsOptional()
  @IsEnum(['embarque', 'desembarque'], {
    message: 'Tipo deve ser "embarque" ou "desembarque"',
  })
  tipo?: 'embarque' | 'desembarque';

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  @Type(() => Boolean)
  ativo?: boolean;
}
