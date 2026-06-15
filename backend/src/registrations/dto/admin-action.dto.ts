import { IsString, IsNotEmpty, IsOptional, IsIn, MaxLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminActionDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  registrationId: string;

  @IsIn(['approve', 'reject'])
  action: string;

  @ValidateIf((dto: AdminActionDto) => dto.action === 'reject')
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  rejectionReason?: string;
}

export class AdminNoteDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  registrationId: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  adminNote: string;
}
