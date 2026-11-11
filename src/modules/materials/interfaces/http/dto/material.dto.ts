import { ApiProperty } from '@nestjs/swagger';
import {
  MATERIAL_GROUPS,
  MATERIAL_USES,
  type Material,
  type MaterialGroup,
  type MaterialUse,
} from '../../../domain/value-objects/material.vo.js';

export class MaterialCostDto {
  @ApiProperty({ type: Number, nullable: true, description: 'Gold added to the base item price' })
  add: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Multiplier of the base item price' })
  multiplier: number | null;
}

export class MaterialDto {
  @ApiProperty({ example: 'e2e-steel' })
  id: string;

  @ApiProperty({ type: String, enum: MATERIAL_GROUPS })
  group: MaterialGroup;

  @ApiProperty({ description: 'Modifier to the item strength in breakage checks' })
  durability: number;

  @ApiProperty({ type: Number, nullable: true, description: 'Crafting modifier and percent less production time; null is special' })
  workability: number | null;

  @ApiProperty({ description: 'OB, DB, Shield or range increment bonus' })
  bonus: number;

  @ApiProperty({ type: Number, nullable: true, description: 'Bonus of a blunt weapon, when it differs' })
  bluntBonus: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Bonus when it replaces metal, when it differs' })
  metalBonus: number | null;

  @ApiProperty({ type: MaterialCostDto })
  cost: MaterialCostDto;

  @ApiProperty({ type: Number, nullable: true, description: 'Gold per pound' })
  costPerPound: number | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Pounds per cubic foot' })
  density: number | null;

  @ApiProperty()
  magical: boolean;

  @ApiProperty()
  alloy: boolean;

  @ApiProperty({ type: String, nullable: true, description: 'Difficulty of the maneuver that makes the alloy' })
  alloyDifficulty: string | null;

  @ApiProperty({ type: Number, nullable: true, description: 'Weight of an armor of this material, as a fraction' })
  armorWeightMultiplier: number | null;

  @ApiProperty({ type: [String], enum: MATERIAL_USES })
  uses: MaterialUse[];

  static fromEntity(entity: Material): MaterialDto {
    return Object.assign(new MaterialDto(), entity);
  }
}
