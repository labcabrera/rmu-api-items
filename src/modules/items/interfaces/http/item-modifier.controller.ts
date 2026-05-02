import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemModifierOption } from '../../domain/value-objects/item-modifier-option.vo';
import { ItemModifierOptionService } from '../../domain/services/item-modifier-option-service';
import { ItemModifierOptionDto } from './dtos/item-modifier-option.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('v1/item-modifiers')
@ApiTags('Item modifiers')
export class ItemModifierController {
  constructor(private readonly optionService: ItemModifierOptionService) {}

  @Get('options')
  @HttpCode(HttpStatus.OK)
  getModifiers(): ItemModifierOptionDto[] {
    const options: ItemModifierOption[] = this.optionService.getOptions();
    return options.map(o => ItemModifierOptionDto.fromEntity(o));
  }
}
