import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { UpdateItemCommand } from '../../../application/cqrs/commands/update-item.command.js';
import type { ItemArmor } from '../../../domain/value-objects/item-armor.vo.js';
import type { ItemInfo } from '../../../domain/value-objects/item-info.vo.js';
import { ItemShield } from '../../../domain/value-objects/item-shield.vo.js';
import { ItemWeapon } from '../../../domain/value-objects/item-weapon.vo.js';
import { ItemModifierDto } from './item-modifier.dto.js';

export class UpdateItemDto {
  @ApiProperty({ type: String, description: 'Item name', required: false })
  @IsOptional()
  @IsString()
  name: string | undefined;

  @ApiProperty({ description: 'Item weapon', required: false })
  @IsOptional()
  @IsObject()
  weapon: ItemWeapon | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  armor: ItemArmor | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  shield: ItemShield | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  info: ItemInfo | undefined;

  @ApiProperty({ description: 'Item modifiers', required: false, isArray: true, type: () => ItemModifierDto })
  @IsOptional()
  modifiers: ItemModifierDto[] | undefined;

  @ApiProperty({ type: String, description: 'Item description', example: 'Some description.' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({ type: String, description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  @ApiPropertyOptional({ description: 'Version the client read (from the GET); a different stored version is a 409', example: 3 })
  @IsInt()
  @Min(0)
  @IsOptional()
  version?: number;

  static toCommand(itemId: string, dto: UpdateItemDto, userId: string, roles: string[]): UpdateItemCommand {
    return new UpdateItemCommand(
      itemId,
      dto.name,
      dto.weapon,
      dto.armor,
      dto.shield,
      dto.info,
      dto.modifiers ? dto.modifiers.map(m => ItemModifierDto.toEntity(m)) : undefined,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
      dto.version,
    );
  }
}
