import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsBoolean, IsIn, ValidateNested } from 'class-validator';
import type { ItemCost } from '../../../domain/value-objects/item-cost.vo.js';
import type { ItemInfo } from '../../../domain/value-objects/item-info.vo.js';
import { ITEM_RARITIES, type ItemRarity } from '../../../domain/value-objects/item-rarity.vo.js';

/**
 * The cost range. Each bound is optional: the item form of rmu-mfe-items sends the bounds the user filled in (spec 021,
 * decision 6).
 */
export class ItemCostDto {
  @ApiProperty({ type: Number, required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  min: number;

  @ApiProperty({ type: Number, required: false, example: 2 })
  @IsOptional()
  @IsNumber()
  average: number;

  @ApiProperty({ type: Number, required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  max: number;

  static toEntity(dto: ItemCostDto): ItemCost {
    return {
      min: dto.min,
      average: dto.average,
      max: dto.max,
    };
  }
}

export class ItemInfoDto {
  @ApiProperty({ type: ItemCostDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemCostDto)
  cost: ItemCostDto | null;

  @IsOptional()
  @IsNumber()
  length: number | null;

  @IsOptional()
  @IsNumber()
  weight: number | null;

  @IsOptional()
  @IsNumber()
  strength: number | null;

  @IsOptional()
  @IsNumber()
  productionHours: number | null;

  // stackable, rarity and unique are required by the stored item: without them the write failed with a 500.
  @ApiProperty({ type: Boolean, example: false })
  @IsBoolean()
  stackable: boolean;

  @ApiProperty({ type: String, enum: ITEM_RARITIES, example: 'common' })
  @IsIn(ITEM_RARITIES)
  rarity: ItemRarity;

  @ApiProperty({ type: Boolean, example: false })
  @IsBoolean()
  unique: boolean;

  static fromEntity(entity: ItemInfo): ItemInfoDto {
    const dto = new ItemInfoDto();
    dto.cost = entity.cost;
    dto.length = entity.length;
    dto.productionHours = entity.productionHours;
    dto.strength = entity.strength;
    dto.weight = entity.weight;
    dto.stackable = entity.stackable;
    dto.rarity = entity.rarity;
    dto.unique = entity.unique;
    return dto;
  }

  static toEntity(dto: ItemInfoDto): ItemInfo {
    return {
      cost: dto.cost ? ItemCostDto.toEntity(dto.cost) : null,
      length: dto.length,
      weight: dto.weight,
      strength: dto.strength,
      productionHours: dto.productionHours,
      stackable: dto.stackable,
      rarity: dto.rarity,
      unique: dto.unique,
    };
  }
}
