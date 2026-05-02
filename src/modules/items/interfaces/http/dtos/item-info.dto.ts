import { IsNumber, IsObject, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ItemCost } from 'src/modules/items/domain/value-objects/item-cost.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import type { ItemRarity } from 'src/modules/items/domain/value-objects/item-rarity.vo';

export class ItemInfoDto {
  @IsOptional()
  @IsObject()
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

  @IsOptional()
  @IsBoolean()
  stackable: boolean;

  @IsOptional()
  @IsIn(['common', 'uncommon', 'rare', 'very-rare'])
  rarity: ItemRarity;

  @IsOptional()
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

export class ItemCostDto {
  @IsNumber()
  min: number;

  @IsNumber()
  average: number;

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
