import { ItemModifierOption, type OptionType } from '../../../domain/value-objects/item-modifier-option.vo.js';
import { ApiProperty } from '@nestjs/swagger';
import { ITEM_MODIFIER_TYPES, type ItemModifierType } from '../../../domain/value-objects/item-modifier-type.vo.js';

const OPTION_TYPES = ['required', 'optional', 'forbidden'];

export class ItemModifierOptionDto {
  @ApiProperty({ type: String, enum: ITEM_MODIFIER_TYPES, example: 'skill-bonus' })
  modifierType: ItemModifierType;

  @ApiProperty({ type: String, nullable: true, description: 'Where the target comes from', example: '@skill' })
  selectorType: string | null;

  @ApiProperty({ type: String, enum: OPTION_TYPES, description: 'Whether the value is required, optional or forbidden' })
  value: OptionType;

  @ApiProperty({ type: String, enum: OPTION_TYPES, description: 'Whether the target is required, optional or forbidden' })
  modifier: OptionType;

  @ApiProperty({ type: String, enum: OPTION_TYPES, description: 'Whether the specialization is required, optional or forbidden' })
  specialization: OptionType;

  static fromEntity(entity: ItemModifierOption): ItemModifierOptionDto {
    const dto = new ItemModifierOptionDto();
    dto.modifierType = entity.modifierType;
    dto.selectorType = entity.selectorType;
    dto.value = entity.value;
    dto.modifier = entity.modifier;
    dto.specialization = entity.specialization;
    return dto;
  }
}
