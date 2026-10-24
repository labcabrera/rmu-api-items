import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { AddItemModifierCommand } from '../../../application/cqrs/commands/add-item-modifier.command.js';
import { ITEM_MODIFIER_TYPES, type ItemModifierType } from '../../../domain/value-objects/item-modifier-type.vo.js';

export class AddItemModifierDto {
  @ApiProperty({ type: String, enum: ITEM_MODIFIER_TYPES, description: 'Modifier type', example: 'bonus' })
  @IsIn(ITEM_MODIFIER_TYPES)
  type!: ItemModifierType;

  @ApiProperty({ type: String, description: 'Modifier target', required: false, example: 'animals' })
  @IsString()
  @IsOptional()
  modifier: string | undefined;

  @ApiProperty({ type: Number, description: 'Numeric value', required: false, example: 15 })
  @IsNumber()
  @IsOptional()
  value: number | undefined;

  static toCommand(itemId: string, dto: AddItemModifierDto, userId: string, roles: string[]): AddItemModifierCommand {
    return new AddItemModifierCommand(itemId, dto.type, dto.modifier, dto.value, userId, roles);
  }
}
