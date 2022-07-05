import { IsInt, IsPositive } from 'class-validator';

export class AddSharesDto {
  @IsPositive()
  @IsInt()
  amount: number;
}
