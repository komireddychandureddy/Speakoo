import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class SendSessionNudgeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  message?: string;

  @IsOptional()
  @IsIn(['push', 'email'])
  channel?: 'push' | 'email';
}
