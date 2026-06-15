import { IsOptional, IsString, IsInt, Min, Max, IsIn, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FindAllQueryDto {
  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' && value.toLowerCase() !== 'all' ? value.toUpperCase() : value)
  @IsIn(['all', 'PENDING_PAYMENT', 'RECEIPT_UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])
  status?: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
