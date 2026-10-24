import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AddItemModifierCommand } from '../../../application/cqrs/commands/add-item-modifier.command.js';
import type { ItemModifierType } from '../../../domain/value-objects/item-modifier-type.vo.js';

export class AddItemModifierDto {
  @ApiProperty({ type: String, description: 'Modifier type', example: 'bonus' })
  @IsString()
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
