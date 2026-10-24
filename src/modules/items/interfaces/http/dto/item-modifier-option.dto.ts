import { ItemModifierOption, type OptionType } from '../../../domain/value-objects/item-modifier-option.vo.js';
import type { ItemModifierType } from '../../../domain/value-objects/item-modifier-type.vo.js';

export class ItemModifierOptionDto {
  modifierType: ItemModifierType;
  selectorType: string | null;
  value: OptionType;
  modifier: OptionType;
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
