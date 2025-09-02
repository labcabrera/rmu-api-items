import { IsNumber, IsObject, IsOptional } from 'class-validator';
import { ItemCost, ItemInfo } from 'src/modules/items/domain/entities/item';

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

  static fromEntity(entity: ItemInfo): ItemInfoDto {
    const dto = new ItemInfoDto();
    dto.cost = entity.cost;
    dto.length = entity.length;
    dto.productionHours = entity.productionHours;
    dto.strength = entity.strength;
    dto.weight = entity.weight;
    return dto;
  }

  static toEntity(dto: ItemInfoDto): ItemInfo {
    return {
      cost: dto.cost ? ItemCostDto.toEntity(dto.cost) : undefined,
      length: dto.length,
      weight: dto.weight,
      weigthPercent: dto.weightPercent,
      strength: dto.strength,
      productionHours: dto.productionHours,
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
