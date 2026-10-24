import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { UpdateItemCommand } from '../../../application/cqrs/commands/update-item.command.js';
import { ItemArmorDto } from './item-armor.dto.js';
import { ItemInfoDto } from './item-info.dto.js';
import { ItemModifierDto } from './item-modifier.dto.js';
import { ItemShieldDto } from './item-shield.dto.js';
import { ItemWeaponDto } from './item-weapon.dto.js';

/**
 * A partial change: absent (or null) objects keep their stored value. The nested objects are validated as in the
 * creation and replace the stored ones whole (F-items-09, F-items-13). rmu-mfe-items sends the whole item it read, with
 * null for the data of the other categories.
 */
export class UpdateItemDto {
  @ApiProperty({ type: String, description: 'Item name', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string | undefined;

  @ApiProperty({ type: ItemWeaponDto, description: 'Weapon info (weapons only)', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemWeaponDto)
  weapon: ItemWeaponDto | undefined;

  @ApiProperty({ type: ItemArmorDto, description: 'Armor info (armors only)', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemArmorDto)
  armor: ItemArmorDto | undefined;

  @ApiProperty({ type: ItemShieldDto, description: 'Shield info (shields only)', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemShieldDto)
  shield: ItemShieldDto | undefined;

  @ApiProperty({ type: ItemInfoDto, description: 'Generic item information', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemInfoDto)
  info: ItemInfoDto | undefined;

  @ApiProperty({ description: 'Item modifiers', required: false, type: [ItemModifierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemModifierDto)
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
      dto.name ?? undefined,
      dto.weapon ? ItemWeaponDto.toEntity(dto.weapon) : undefined,
      dto.armor ? ItemArmorDto.toEntity(dto.armor) : undefined,
      dto.shield ? ItemShieldDto.toEntity(dto.shield) : undefined,
      dto.info ? ItemInfoDto.toEntity(dto.info) : undefined,
      dto.modifiers ? dto.modifiers.map(m => ItemModifierDto.toEntity(m)) : undefined,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
      dto.version,
    );
  }
}
