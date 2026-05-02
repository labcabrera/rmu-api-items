import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemModifierOption } from '../../domain/value-objects/item-modifier-option.vo';
import { ItemModifierOptionService } from '../../domain/services/item-modifier-option-service';
import { ItemModifierOptionDto } from './dtos/item-modifier-option.dto';

@Controller('item-modifiers')
export class ItemModifierController {
  constructor(private readonly optionService: ItemModifierOptionService) {}

  @Get('modifiers')
  @HttpCode(HttpStatus.OK)
  getModifiers(): ItemModifierOptionDto[] {
    const options: ItemModifierOption[] = this.optionService.getOptions();
    return options.map(o => ItemModifierOptionDto.fromEntity(o));
  }
}
