import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  type ItemAmmunition,
  type ItemAntidote,
  type ItemContainer,
  type ItemFeatures,
  type ItemLight,
  type ItemPoison,
  type ItemRange,
  type ItemTransport,
  POISON_CATEGORIES,
  POISON_FORMS,
  POISON_SEVERITIES,
  type PoisonCategory,
  type PoisonForm,
  type PoisonSeverity,
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

export class ItemRangeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  min: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  max: number;

  static toEntity(dto: ItemRangeDto | null | undefined): ItemRange | null {
    return dto ? { min: dto.min, max: dto.max } : null;
  }
}

/** Spec 042, decision 2. */
export class ItemPoisonDto {
  @ApiProperty({ type: String, enum: POISON_CATEGORIES, example: 'circulatory' })
  @IsIn(POISON_CATEGORIES)
  category: PoisonCategory;

  @ApiProperty({ description: 'Attack level of the resistance roll', example: 5 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ type: String, enum: POISON_FORMS, example: 'paste' })
  @IsIn(POISON_FORMS)
  form: PoisonForm;

  @ApiProperty({ type: String, enum: POISON_SEVERITIES, required: false, description: 'Worst severity it can reach' })
  @IsOptional()
  @IsIn(POISON_SEVERITIES)
  maxSeverity: PoisonSeverity | null;

  @ApiProperty({ type: ItemRangeDto, required: false, description: 'Hits dealt at once when the RR fails' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemRangeDto)
  immediateHits: ItemRangeDto | null;

  @ApiProperty({ type: ItemRangeDto, required: false, description: 'Rounds until its first effects' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemRangeDto)
  onsetRounds: ItemRangeDto | null;

  static toEntity(dto: ItemPoisonDto): ItemPoison {
    return {
      category: dto.category,
      level: dto.level,
      form: dto.form,
      maxSeverity: dto.maxSeverity ?? null,
      immediateHits: ItemRangeDto.toEntity(dto.immediateHits),
      onsetRounds: ItemRangeDto.toEntity(dto.onsetRounds),
    };
  }
}

export class ItemAntidoteDto {
  @ApiProperty({ type: [String], enum: [...POISON_CATEGORIES, 'any'], example: ['nerve'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsIn([...POISON_CATEGORIES, 'any'], { each: true })
  categories: (PoisonCategory | 'any')[];

  @ApiProperty({ description: 'Highest poison level it stops', example: 4 })
  @IsInt()
  @Min(0)
  level: number;

  @ApiProperty({ type: Number, required: false, description: 'Hours after the exposure it still works' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  withinHours: number | null;

  static toEntity(dto: ItemAntidoteDto): ItemAntidote {
    return { categories: [...new Set(dto.categories)], level: dto.level, withinHours: dto.withinHours ?? null };
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

  @ApiProperty({ type: ItemPoisonDto, required: false, description: 'Poison data (spec 042)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemPoisonDto)
  poison?: ItemPoisonDto | null;

  @ApiProperty({ type: ItemAntidoteDto, required: false, description: 'Antidote data (spec 042)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemAntidoteDto)
  antidote?: ItemAntidoteDto | null;

  /** Only the blocks it has; null when it has none. */
  static toEntity(dto: ItemFeaturesDto): ItemFeatures | null {
    const features: ItemFeatures = {};
    if (dto.container) features.container = ItemContainerDto.toEntity(dto.container);
    if (dto.light) features.light = ItemLightDto.toEntity(dto.light);
    if (dto.transport) features.transport = ItemTransportDto.toEntity(dto.transport);
    if (dto.ammunition) features.ammunition = ItemAmmunitionDto.toEntity(dto.ammunition);
    if (dto.poison) features.poison = ItemPoisonDto.toEntity(dto.poison);
    if (dto.antidote) features.antidote = ItemAntidoteDto.toEntity(dto.antidote);
    return Object.keys(features).length > 0 ? features : null;
  }

  static fromEntity(entity: ItemFeatures | null | undefined): ItemFeaturesDto | null {
    if (!entity) return null;
    const dto = new ItemFeaturesDto();
    if (entity.container) dto.container = { ...entity.container };
    if (entity.light) dto.light = { ...entity.light };
    if (entity.transport) dto.transport = { ...entity.transport };
    if (entity.ammunition) dto.ammunition = { ...entity.ammunition, launchers: [...entity.ammunition.launchers] };
    if (entity.poison) dto.poison = Object.assign(new ItemPoisonDto(), entity.poison);
    if (entity.antidote) dto.antidote = { ...entity.antidote, categories: [...entity.antidote.categories] };
    return Object.keys(dto).length > 0 ? dto : null;
  }
}
