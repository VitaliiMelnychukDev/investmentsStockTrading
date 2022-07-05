import { IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdatePriceDto {
  @IsNumber()
  @IsPositive()
  price: number;
}
