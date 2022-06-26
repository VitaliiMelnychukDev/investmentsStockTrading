import { IsString, Length } from 'class-validator';

export class UpdateCardNumberDto {
  @IsString()
  @Length(16, 16)
  cardNumber: string;
}
