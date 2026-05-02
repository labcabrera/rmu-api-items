import { Injectable } from '@nestjs/common';
import { ItemModifierOption } from '../value-objects/item-modifier-option.vo';

@Injectable()
export class ItemModifierOptionService {
  getOptions(): ItemModifierOption[] {
    return [
      new ItemModifierOption('bonus', null, 'required', 'forbidden', 'forbidden'),
      new ItemModifierOption('item-damage', null, 'required', 'forbidden', 'forbidden'),
      new ItemModifierOption('skill-bonus', '@skill', 'required', 'required', 'optional'),
      new ItemModifierOption('material', '@enumeration:material-lore', 'forbidden', 'required', 'forbidden'),
      new ItemModifierOption('slayer', '@enumeration:animal-type|@creature', 'forbidden', 'required', 'forbidden'),
    ];
  }
}
