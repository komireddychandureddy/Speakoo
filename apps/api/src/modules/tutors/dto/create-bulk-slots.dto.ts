import { IsArray, IsISO8601, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SlotInput {
  @IsISO8601()
  startTime!: string;

  @IsISO8601()
  endTime!: string;
}

export class CreateBulkSlotsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SlotInput)
  slots!: SlotInput[];
}
