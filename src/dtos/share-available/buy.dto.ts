import { IsInt, IsPositive, IsString, Length, Max, Min } from 'class-validator';

export class BuyDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsString()
  @Length(16, 16)
  cardNumber: string;

  @IsInt()
  @Min(100)
  @Max(999)
  cvv: number;

  @IsInt()
  @Min(new Date().getFullYear())
  @Max(new Date().getFullYear() + 4)
  expirationYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  expirationMonth: number;
}
