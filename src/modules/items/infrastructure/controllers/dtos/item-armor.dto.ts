import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import * as item from 'src/modules/items/domain/entities/item';
import { ItemArmor } from 'src/modules/items/domain/entities/item';

export class ItemArmorDto {
  @ApiProperty({ description: 'Armor slot', type: String, example: 'chest' })
  slot: item.ArmorSlot;

  @ApiProperty({ description: 'Armor type', type: Number, example: 5 })
  @IsNumber()
  at: number;

  enc: number;

  maneuver: number;

  rangedPenalty: number;

  perception: number;

  baseDifficulty: item.DifficultyCode;

  static toEntity(dto: ItemArmorDto): ItemArmor {
    return {
      slot: dto.slot,
      at: dto.at,
      enc: dto.enc,
      maneuver: dto.maneuver,
      rangedPenalty: dto.rangedPenalty,
      perception: dto.perception,
      baseDifficulty: dto.baseDifficulty,
    };
  }

  static fromEntity(entity: item.ItemArmor): ItemArmorDto {
    const dto = new ItemArmorDto();
    dto.slot = entity.slot;
    dto.at = entity.at;
    dto.enc = entity.enc;
    dto.maneuver = entity.maneuver;
    dto.rangedPenalty = entity.rangedPenalty;
    dto.perception = entity.perception;
    dto.baseDifficulty = entity.baseDifficulty;
    return dto;
  }
}
