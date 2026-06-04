import { IsIn } from 'class-validator';

export class UpdateSessionPresenceDto {
  @IsIn(['joined', 'left'])
  status!: 'joined' | 'left';
}
