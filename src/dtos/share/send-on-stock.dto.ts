import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class SendOnStockDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price: number;
}
