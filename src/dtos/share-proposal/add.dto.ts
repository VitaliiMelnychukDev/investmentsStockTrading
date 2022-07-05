import {
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Max,
} from 'class-validator';

export class AddDto {
  @IsString()
  ticker: string;

  @IsInt()
  @IsPositive()
  @Max(100)
  amount: number;

  @IsString()
  @Length(256, 256)
  cardCode: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
