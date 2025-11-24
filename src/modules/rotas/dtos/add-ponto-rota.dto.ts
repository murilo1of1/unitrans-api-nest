import {
  IsNotEmpty,
  IsInt,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddPontoRotaDto {
  @IsNotEmpty({ message: 'ID do ponto é obrigatório' })
  @IsInt({ message: 'ID do ponto deve ser um número inteiro' })
  @Type(() => Number)
  idPonto: number;

  @IsNotEmpty({ message: 'Ordem é obrigatória' })
  @IsInt({ message: 'Ordem deve ser um número inteiro' })
  @Type(() => Number)
  ordem: number;

  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsEnum(['embarque', 'desembarque'], {
    message: 'Tipo deve ser "embarque" ou "desembarque"',
  })
  tipo: 'embarque' | 'desembarque';

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  @Type(() => Boolean)
  ativo?: boolean;
}
