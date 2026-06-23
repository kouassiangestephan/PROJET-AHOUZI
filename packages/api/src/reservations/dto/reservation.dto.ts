import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReservationStatus, BookingSource } from '@prisma/client';

export class CreateReservationDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsString()
  customerId: string;

  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty({ example: '2024-12-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2024-12-05' })
  @IsDateString()
  checkOut: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ enum: BookingSource, default: BookingSource.DIRECT })
  @IsOptional()
  @IsEnum(BookingSource)
  source?: BookingSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountAmount?: number;
}

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}

export class CancelReservationDto {
  @ApiProperty({ example: 'Annulation à la demande du client' })
  @IsString()
  reason: string;
}

export class CheckInDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AvailabilitySearchDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2024-12-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2024-12-05' })
  @IsDateString()
  checkOut: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;
}
