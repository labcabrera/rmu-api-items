import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemModifierOption } from '../../domain/value-objects/item-modifier-option.vo.js';
import { ItemModifierOptionService } from '../../domain/services/item-modifier-option.service.js';
import { ItemModifierOptionDto } from './dto/item-modifier-option.dto.js';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('v1/item-modifiers')
@ApiTags('Item modifiers')
export class ItemModifierController {
  constructor(private readonly optionService: ItemModifierOptionService) {}

  @Get('options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: 'getItemModifierOptions', summary: 'What each modifier type needs (public, without a token)' })
  @ApiOkResponse({ type: [ItemModifierOptionDto] })
  getModifiers(): ItemModifierOptionDto[] {
    const options: ItemModifierOption[] = this.optionService.getOptions();
    return options.map(o => ItemModifierOptionDto.fromEntity(o));
  }
}
