import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({ example: 1, description: 'Customer ID' })
  @IsInt()
  @IsPositive()
  customerId!: number;

  @ApiProperty({ example: 1, description: 'Loan ID' })
  @IsInt()
  @IsPositive()
  loanId!: number;
}
