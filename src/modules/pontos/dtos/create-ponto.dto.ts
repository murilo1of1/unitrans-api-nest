import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePontoDto {
  @ApiProperty({ description: 'Nome do ponto', example: 'Terminal Central' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Endereço do ponto',
    example: 'Rua Principal, 123',
  })
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @IsString()
  endereco: string;

  @ApiProperty({ description: 'Latitude', example: -23.5505, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Latitude deve ser um número' })
  latitude?: number;

  @ApiProperty({ description: 'Longitude', example: -46.6333, required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Longitude deve ser um número' })
  longitude?: number;

  @ApiProperty({ description: 'ID da empresa', example: 1 })
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @IsNumber({}, { message: 'ID da empresa deve ser um número' })
  idEmpresa: number;
}
