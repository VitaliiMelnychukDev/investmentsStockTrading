import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';

export class CreateDto {
  @IsString()
  @Length(1, 256)
  name: string;

  @IsString()
  @Length(1, 256)
  ticker: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  wholeAmount: number;
}
