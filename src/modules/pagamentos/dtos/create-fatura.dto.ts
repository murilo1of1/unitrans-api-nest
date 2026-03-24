import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFaturaDto {
  @IsNumber()
  @IsNotEmpty()
  alunoId: number;

  @IsNumber()
  @IsNotEmpty()
  empresaId: number;

  @IsNumber()
  @IsOptional()
  planoId?: number;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @IsString()
  @IsOptional()
  dataVencimento?: string;

  @IsString()
  @IsOptional()
  mes_referencia?: string;
}
