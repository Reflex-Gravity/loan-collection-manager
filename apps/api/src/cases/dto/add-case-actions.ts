import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActionType, ActionOutcome } from '@lcm/shared';

export class AddActionDto {
  @ApiProperty({ enum: ActionType, example: ActionType.CALL })
  @IsEnum(ActionType)
  type!: ActionType;

  @ApiProperty({ enum: ActionOutcome, example: ActionOutcome.PROMISE_TO_PAY })
  @IsEnum(ActionOutcome)
  outcome!: ActionOutcome;

  @ApiPropertyOptional({ example: 'Customer promised to pay on Friday' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
