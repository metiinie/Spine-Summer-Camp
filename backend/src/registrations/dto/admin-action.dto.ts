import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength } from 'class-validator';

export class AdminActionDto {
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @IsIn(['approve', 'reject'])
  action: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}

export class AdminNoteDto {
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  adminNote: string;
}
