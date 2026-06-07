import {
  IsString, IsEmail, IsInt, IsIn, IsOptional, IsBoolean,
  IsDateString, MinLength, MaxLength, Min, Max, ValidateNested, IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CamperDto {
  @IsString() @IsNotEmpty() @MaxLength(100) firstName: string;
  @IsString() @IsNotEmpty() @MaxLength(100) lastName: string;
  @IsInt() @Min(4) @Max(18) age: number;
  @IsDateString() dateOfBirth: string;
  @IsIn(['MALE', 'FEMALE']) gender: string;
  @IsString() @IsNotEmpty() @MaxLength(50) gradeLevel: string;
  @IsString() @IsNotEmpty() @MaxLength(150) schoolName: string;
  @IsIn(['YOUTH_S', 'YOUTH_M', 'YOUTH_L', 'ADULT_S', 'ADULT_M', 'ADULT_L']) tShirtSize: string;
  @IsOptional() @IsInt() @Min(50) @Max(220) height?: number;
  @IsOptional() @IsInt() @Min(10) @Max(150) weight?: number;
}

export class ParentDto {
  @IsString() @IsNotEmpty() @MaxLength(150) primaryName: string;
  @IsString() @IsNotEmpty() @MaxLength(50) primaryRelationship: string;
  @IsString() @IsNotEmpty() @MaxLength(20) primaryPhone: string;
  @IsEmail() @MaxLength(255) primaryEmail: string;
  @IsOptional() @IsString() @MaxLength(150) secondaryName?: string;
  @IsOptional() @IsString() @MaxLength(20) secondaryPhone?: string;
  @IsOptional() @IsString() @MaxLength(50) secondaryRelationship?: string;
  @IsString() @IsNotEmpty() @MaxLength(100) subCity: string;
  @IsString() @IsNotEmpty() @MaxLength(100) district: string;
  @IsOptional() @IsString() @MaxLength(50) houseNumber?: string;
}

export class SessionDto {
  @IsIn(['HALF_DAY', 'FULL_DAY']) session: string;
}

export class MedicalDto {
  @IsOptional() @IsString() @MaxLength(500) allergies?: string;
  @IsOptional() @IsString() @MaxLength(500) conditions?: string;
  @IsOptional() @IsString() @MaxLength(500) dietary?: string;
}

export class WaiverDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean() liabilityRelease: boolean;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean() mediaRelease: boolean;

  @IsString() @IsNotEmpty() @MaxLength(150) parentSignature: string;
  @IsOptional() @IsDateString() dateSigned?: string;
}

export class CreateRegistrationDto {
  @ValidateNested() @Type(() => CamperDto) camper: CamperDto;
  @ValidateNested() @Type(() => ParentDto) parent: ParentDto;
  @ValidateNested() @Type(() => SessionDto) session: SessionDto;
  @IsOptional() @ValidateNested() @Type(() => MedicalDto) medical?: MedicalDto;
  @IsOptional() @ValidateNested() @Type(() => WaiverDto) waiver?: WaiverDto;
}
