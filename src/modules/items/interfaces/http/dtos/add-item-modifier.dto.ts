import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { AddItemModifierCommand } from 'src/modules/items/application/cqrs/commands/add-item-modifier.command';
import type { ItemModifierType } from 'src/modules/items/domain/value-objects/item-modifier-type.vo';

export class AddItemModifierDto {
  @ApiProperty({ description: 'Modifier type', example: 'bonus' })
  @IsString()
  type!: ItemModifierType;

  @ApiProperty({ description: 'Modifier target', required: false, example: 'animals' })
  @IsString()
  @IsOptional()
  modifier: string | undefined;

  @ApiProperty({ description: 'Numeric value', required: false, example: 15 })
  @IsNumber()
  @IsOptional()
  value: number | undefined;

  static toCommand(itemId: string, dto: AddItemModifierDto, userId: string, roles: string[]): AddItemModifierCommand {
    return new AddItemModifierCommand(itemId, dto.type, dto.modifier, dto.value, userId, roles);
  }
}
