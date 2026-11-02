import { Injectable } from '@nestjs/common';
import { ITEM_MODIFIER_OPTIONS, ItemModifierOption } from '../value-objects/item-modifier-option.vo.js';

@Injectable()
export class ItemModifierOptionService {
  getOptions(): ItemModifierOption[] {
    return [...ITEM_MODIFIER_OPTIONS];
  }
}
