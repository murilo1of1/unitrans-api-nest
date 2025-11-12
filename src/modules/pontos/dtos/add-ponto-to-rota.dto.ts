import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPontoToRotaDto {
  @ApiProperty({ description: 'ID da rota', example: 1 })
  @IsNotEmpty({ message: 'ID da rota é obrigatório' })
  @IsNumber({}, { message: 'ID da rota deve ser um número' })
  idRota: number;

  @ApiProperty({ description: 'ID do ponto', example: 1 })
  @IsNotEmpty({ message: 'ID do ponto é obrigatório' })
  @IsNumber({}, { message: 'ID do ponto deve ser um número' })
  idPonto: number;

  @ApiProperty({ description: 'Ordem do ponto na rota', example: 1 })
  @IsNotEmpty({ message: 'Ordem é obrigatória' })
  @IsNumber({}, { message: 'Ordem deve ser um número' })
  ordem: number;

  @ApiProperty({
    description: 'Tipo do ponto',
    enum: ['embarque', 'desembarque'],
    example: 'embarque',
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsEnum(['embarque', 'desembarque'], {
    message: 'Tipo deve ser "embarque" ou "desembarque"',
  })
  tipo: 'embarque' | 'desembarque';

  @ApiProperty({ description: 'Status ativo', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um valor booleano' })
  ativo?: boolean;
}
