import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  @ApiProperty({ example: '120.99' })
  amount: number;
}
