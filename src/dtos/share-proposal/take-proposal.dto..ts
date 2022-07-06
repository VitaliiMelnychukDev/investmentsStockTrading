import { IsInt, IsPositive } from 'class-validator';

export class TakeProposalDto {
  @IsInt()
  @IsPositive()
  amount: number;
}
