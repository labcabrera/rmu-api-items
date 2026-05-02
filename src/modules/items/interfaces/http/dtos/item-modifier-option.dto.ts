import { ItemModifierOption } from 'src/modules/items/domain/value-objects/item-modifier-option.vo';
import type { ItemModifierType } from 'src/modules/items/domain/value-objects/item-modifier-type.vo';

export class ItemModifierOptionDto {
  modifierType: ItemModifierType;
  selectorType: string | null;
  allowValue: boolean;
  allowModifier: boolean;
  allowSpecialization: boolean;

  static fromEntity(entity: ItemModifierOption): ItemModifierOptionDto {
    const dto = new ItemModifierOptionDto();
    dto.modifierType = entity.modifierType;
    dto.selectorType = entity.selectorType;
    dto.allowValue = entity.allowValue;
    dto.allowModifier = entity.allowModifier;
    dto.allowSpecialization = entity.allowSpecialization;
    return dto;
  }
}
