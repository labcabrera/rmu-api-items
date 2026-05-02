import { IsNumber, IsObject, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ItemCost } from 'src/modules/items/domain/value-objects/item-cost.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemRarity } from 'src/modules/items/domain/value-objects/item-rarity.vo';

export class ItemInfoDto {
  @IsOptional()
  @IsObject()
  cost: ItemCostDto | undefined;

  @IsOptional()
  @IsNumber()
  length: number | undefined;

  @IsOptional()
  @IsNumber()
  weight: number | undefined;

  @IsOptional()
  @IsNumber()
  weightPercent: number | undefined;

  @IsOptional()
  @IsNumber()
  strength: number | undefined;

  @IsOptional()
  @IsNumber()
  productionHours: number | undefined;

  @IsOptional()
  @IsBoolean()
  stackable: boolean | undefined;

  @IsOptional()
  @IsIn(['common', 'uncommon', 'rare', 'very-rare'])
  rarity: ItemRarity | undefined;

  @IsOptional()
  @IsBoolean()
  unique: boolean | undefined;

  static fromEntity(entity: ItemInfo): ItemInfoDto {
    const dto = new ItemInfoDto();
    dto.cost = entity.cost;
    dto.length = entity.length;
    dto.productionHours = entity.productionHours;
    dto.strength = entity.strength;
    dto.weight = entity.weight;
    dto.weightPercent = entity.weightPercent;
    dto.stackable = entity.stackable;
    dto.rarity = entity.rarity;
    dto.unique = entity.unique;
    return dto;
  }

  static toEntity(dto: ItemInfoDto): ItemInfo {
    return {
      cost: dto.cost ? ItemCostDto.toEntity(dto.cost) : undefined,
      length: dto.length,
      weight: dto.weight,
      weightPercent: dto.weightPercent,
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
