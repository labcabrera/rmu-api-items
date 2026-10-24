import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';
import { ARMOR_SLOTS, type ArmorSlot } from '../../../domain/value-objects/armor-slot.vo.js';
import { DIFFICULTY_CODES, type DifficultyCode } from '../../../domain/value-objects/difficulty-code.vo.js';
import type { ItemArmor } from '../../../domain/value-objects/item-armor.vo.js';

export class ItemArmorDto {
  @ApiProperty({ description: 'Armor slot', type: String, enum: ARMOR_SLOTS, example: 'body' })
  @IsIn(ARMOR_SLOTS)
  slot: ArmorSlot;

  @ApiProperty({ description: 'Armor type', type: Number, example: 5 })
  @IsNumber()
  at: number;

  @ApiProperty({ description: 'Encumbrance', type: Number, example: 10 })
  @IsNumber()
  enc: number;

  @ApiProperty({ description: 'Maneuver penalty', type: Number, example: -10 })
  @IsNumber()
  maneuverPenalty: number;

  @ApiProperty({ description: 'Ranged penalty', type: Number, example: 0 })
  @IsNumber()
  rangedPenalty: number;

  @ApiProperty({ description: 'Perception penalty', type: Number, example: 0 })
  @IsNumber()
  perceptionPenalty: number;

  @ApiProperty({ description: 'Base difficulty of the maneuvers in the armor', type: String, enum: DIFFICULTY_CODES, example: 'm' })
  @IsIn(DIFFICULTY_CODES)
  baseDifficulty: DifficultyCode;

  static toEntity(dto: ItemArmorDto): ItemArmor {
    return {
      slot: dto.slot,
      at: dto.at,
      enc: dto.enc,
      maneuverPenalty: dto.maneuverPenalty,
      rangedPenalty: dto.rangedPenalty,
      perceptionPenalty: dto.perceptionPenalty,
      baseDifficulty: dto.baseDifficulty,
    };
  }

  static fromEntity(entity: ItemArmor): ItemArmorDto {
    const dto = new ItemArmorDto();
    dto.slot = entity.slot;
    dto.at = entity.at;
    dto.enc = entity.enc;
    dto.maneuverPenalty = entity.maneuverPenalty;
    dto.rangedPenalty = entity.rangedPenalty;
    dto.perceptionPenalty = entity.perceptionPenalty;
    dto.baseDifficulty = entity.baseDifficulty;
    return dto;
  }
}
