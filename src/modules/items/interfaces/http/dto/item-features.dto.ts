import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, IsNumber, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import type {
  ItemAmmunition,
  ItemContainer,
  ItemFeatures,
  ItemLight,
  ItemTransport,
} from '../../../domain/value-objects/item-features.vo.js';

export class ItemContainerDto {
  @ApiProperty({ type: Number, description: 'Pounds it holds', required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight: number | null;

  @ApiProperty({ type: Number, description: 'Cubic feet it holds', required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume: number | null;

  @ApiProperty({ type: Number, description: 'Gallons it holds', required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  liquid: number | null;

  @ApiProperty({ type: Number, description: 'Units it holds (arrows, weapons)', required: false, example: 20 })
  @IsOptional()
  @IsInt()
  @Min(0)
  units: number | null;

  static toEntity(dto: ItemContainerDto): ItemContainer {
    return { weight: dto.weight ?? null, volume: dto.volume ?? null, liquid: dto.liquid ?? null, units: dto.units ?? null };
  }
}

export class ItemLightDto {
  @ApiProperty({ type: Number, description: 'Radius lit, in feet', required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  radius: number | null;

  @ApiProperty({ type: Number, description: 'Hours of light of each load', required: false, example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationHours: number | null;

  static toEntity(dto: ItemLightDto): ItemLight {
    return { radius: dto.radius ?? null, durationHours: dto.durationHours ?? null };
  }
}

export class ItemTransportDto {
  @ApiProperty({ type: Number, description: 'Pounds it carries', required: false, example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capacity: number | null;

  @ApiProperty({ type: Number, description: 'Feet per round', required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  speed: number | null;

  static toEntity(dto: ItemTransportDto): ItemTransport {
    return { capacity: dto.capacity ?? null, speed: dto.speed ?? null };
  }
}

export class ItemAmmunitionDto {
  @ApiProperty({ type: [String], description: 'Item types that shoot it', example: ['short-bow'] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  launchers: string[];

  @ApiProperty({ type: Number, description: 'Attack size adjustment', example: 0 })
  @IsInt()
  sizeAdjustment: number;

  static toEntity(dto: ItemAmmunitionDto): ItemAmmunition {
    return { launchers: [...new Set(dto.launchers)], sizeAdjustment: dto.sizeAdjustment };
  }
}

/** The general equipment blocks (workspace spec 041, decision 4): each one optional. */
export class ItemFeaturesDto {
  @ApiProperty({ type: ItemContainerDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemContainerDto)
  container?: ItemContainerDto | null;

  @ApiProperty({ type: ItemLightDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemLightDto)
  light?: ItemLightDto | null;

  @ApiProperty({ type: ItemTransportDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemTransportDto)
  transport?: ItemTransportDto | null;

  @ApiProperty({ type: ItemAmmunitionDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAmmunitionDto)
  ammunition?: ItemAmmunitionDto | null;

  /** Only the blocks it has; null when it has none. */
  static toEntity(dto: ItemFeaturesDto): ItemFeatures | null {
    const features: ItemFeatures = {};
    if (dto.container) features.container = ItemContainerDto.toEntity(dto.container);
    if (dto.light) features.light = ItemLightDto.toEntity(dto.light);
    if (dto.transport) features.transport = ItemTransportDto.toEntity(dto.transport);
    if (dto.ammunition) features.ammunition = ItemAmmunitionDto.toEntity(dto.ammunition);
    return Object.keys(features).length > 0 ? features : null;
  }

  static fromEntity(entity: ItemFeatures | null | undefined): ItemFeaturesDto | null {
    if (!entity) return null;
    const dto = new ItemFeaturesDto();
    if (entity.container) dto.container = { ...entity.container };
    if (entity.light) dto.light = { ...entity.light };
    if (entity.transport) dto.transport = { ...entity.transport };
    if (entity.ammunition) dto.ammunition = { ...entity.ammunition, launchers: [...entity.ammunition.launchers] };
    return Object.keys(dto).length > 0 ? dto : null;
  }
}
