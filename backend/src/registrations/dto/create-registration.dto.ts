import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type, Transform } from 'class-transformer';

const PHONE_PATTERN = /^\+?[0-9\s().-]{9,20}$/;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export class CamperDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(100) firstName: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(100) lastName: string;

  @Type(() => Number)
  @IsInt() @Min(4) @Max(18) age: number;

  @IsIn(['MALE', 'FEMALE']) gender: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(50) gradeLevel: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(150) schoolName: string;

  @IsIn(['YOUTH_S', 'YOUTH_M', 'YOUTH_L', 'ADULT_S', 'ADULT_M', 'ADULT_L', 'ADULT_XL']) tShirtSize: string;

  @Type(() => Number)
  @IsOptional() @IsInt() @Min(50) @Max(220) height?: number;

  @Type(() => Number)
  @IsOptional() @IsInt() @Min(10) @Max(150) weight?: number;
}

export class ParentDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(150) primaryName: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(50) primaryRelationship: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(20) @Matches(PHONE_PATTERN, { message: 'Invalid primary phone number' }) primaryPhone: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail() @MaxLength(255) primaryEmail: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(150) secondaryName?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(20) @Matches(PHONE_PATTERN, { message: 'Invalid secondary phone number' }) secondaryPhone?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(50) secondaryRelationship?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(100) subCity: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(100) district: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(50) houseNumber?: string;
}

export class SessionDto {
  @IsIn(['HALF_DAY', 'FULL_DAY']) session: string;
}

export class MedicalDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(500) allergies?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(500) conditions?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional() @IsString() @MaxLength(500) dietary?: string;
}

export class WaiverDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean() @Equals(true, { message: 'Liability release must be accepted' }) liabilityRelease: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean() mediaRelease: boolean;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @IsNotEmpty() @MaxLength(150) parentSignature: string;

  @IsOptional() @IsDateString() dateSigned?: string;
}

export class CreateRegistrationDto {
  @ValidateNested() @Type(() => CamperDto) camper: CamperDto;
  @ValidateNested() @Type(() => ParentDto) parent: ParentDto;
  @ValidateNested() @Type(() => SessionDto) session: SessionDto;
  @IsOptional() @ValidateNested() @Type(() => MedicalDto) medical?: MedicalDto;
  @ValidateNested() @IsNotEmptyObject() @Type(() => WaiverDto) waiver: WaiverDto;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  @Matches(IDEMPOTENCY_KEY_PATTERN, { message: 'Invalid idempotency key' })
  idempotencyKey?: string;
}
