import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { PropertyType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Villas Ahouzi Cocody' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'VAC001' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ enum: PropertyType, default: PropertyType.HOTEL })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiProperty({ example: 'Rue des Jardins, Cocody' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Abidjan' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ default: "Côte d'Ivoire" })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '+2252700000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@ahouzi.ci' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: '14:00' })
  @IsOptional()
  @IsString()
  checkInTime?: string;

  @ApiPropertyOptional({ default: '12:00' })
  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @ApiPropertyOptional({ default: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class CreateRoomDto {
  @ApiProperty({ example: '101' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ example: 'Suite Présidentielle' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  roomTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buildingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  floorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 75000 })
  basePrice: number;

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  maxOccupancy?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  amenities?: any;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}
