import { IsInt, IsNotEmpty } from 'class-validator';

export class GerarTokenDto {
  @IsNotEmpty({ message: 'ID da empresa é obrigatório' })
  @IsInt({ message: 'ID da empresa deve ser um número inteiro' })
  empresaId: number;
}
