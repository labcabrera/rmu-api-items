import { Injectable } from '@nestjs/common';
import { ItemModifierOption } from '../value-objects/item-modifier-option.vo';

@Injectable()
export class ItemModifierOptionService {
  getOptions(): ItemModifierOption[] {
    return [
      new ItemModifierOption('bonus', null, true, false, true),
      new ItemModifierOption('skill-bonus', '@skill', true, true, true),
      new ItemModifierOption('material', '@enumeration:material', false, true, false),
    ];
  }
}
