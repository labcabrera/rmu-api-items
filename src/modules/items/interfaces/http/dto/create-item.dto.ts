import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { ItemArmorDto } from './item-armor.dto.js';
import { ItemInfoDto } from './item-info.dto.js';
import { ItemShieldDto } from './item-shield.dto.js';
import { ItemFeaturesDto } from './item-features.dto.js';
import { ItemWeaponDto } from './item-weapon.dto.js';
import { ItemModifierDto } from './item-modifier.dto.js';
import type { ItemCategory } from '../../../domain/value-objects/item-category.vo.js';
import { CreateItemCommand } from '../../../application/cqrs/commands/create-item.command.js';

/** The ids of core: letters, digits, dashes and underscores (UUIDs and the old slugs). */
export const REALM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export class CreateItemDto {
  @ApiProperty({ description: 'Item name', example: 'Dagger', required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: String, description: 'Realm identifier from core module', required: false, example: 'lotr' })
  @IsString()
  // An id of core: it goes in the URL of the realm check, so no slashes or dots (F-items-17).
  @Matches(REALM_ID_PATTERN, { message: 'realmId must be an id: letters, digits, - and _' })
  @IsOptional()
  realmId: string | null;

  @ApiProperty({ type: String, description: 'Item category', example: 'weapon' })
  @IsString()
  @IsNotEmpty()
  category: ItemCategory;

  @ApiProperty({ type: ItemWeaponDto, description: 'Weapon info, required for weapons', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemWeaponDto)
  weapon: ItemWeaponDto | null;

  @ApiProperty({ type: ItemArmorDto, description: 'Armor info, required for armors', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemArmorDto)
  armor: ItemArmorDto | null;

  @ApiProperty({ type: ItemShieldDto, description: 'Shield info, required for shields', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemShieldDto)
  shield: ItemShieldDto | null;

  @ApiProperty({ type: ItemFeaturesDto, description: 'Container, light, transport or ammunition info (spec 041)', required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ItemFeaturesDto)
  features: ItemFeaturesDto | null;

  @ApiProperty({ type: ItemInfoDto, description: 'Generic item information', required: true })
  @IsObject()
  @ValidateNested()
  @Type(() => ItemInfoDto)
  info: ItemInfoDto;

  @ApiProperty({ description: 'Item modifiers', required: false, type: [ItemModifierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemModifierDto)
  modifiers: ItemModifierDto[] | null;

  @ApiProperty({ type: String, description: 'Item description', example: 'Some item description' })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({ type: String, description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | null;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    return new CreateItemCommand(
      dto.name,
      dto.realmId,
      dto.category,
      dto.weapon ? ItemWeaponDto.toEntity(dto.weapon) : null,
      dto.armor ? ItemArmorDto.toEntity(dto.armor) : null,
      dto.shield ? ItemShieldDto.toEntity(dto.shield) : null,
      dto.features ? ItemFeaturesDto.toEntity(dto.features) : null,
      ItemInfoDto.toEntity(dto.info),
      dto.modifiers ? dto.modifiers.map(m => ItemModifierDto.toEntity(m)) : null,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
