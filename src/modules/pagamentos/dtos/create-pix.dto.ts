import { IsNumber, IsOptional, IsString, IsObject } from 'class-validator';

export class CreatePixDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  customer?: {
    name?: string;
    cellphone?: string;
    email: string;
    taxId?: string;
  };
}
