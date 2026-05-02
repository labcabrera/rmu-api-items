import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';
import { ItemModifierDto } from './item-modifier.dto';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { CreateItemCommand } from 'src/modules/items/application/cqrs/commands/create-item.command';

export class CreateItemDto {
  @ApiProperty({ description: 'Item identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Item name', example: 'Dagger', required: false })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({ description: 'Realm identifier from core module', required: false, example: 'lotr' })
  @IsString()
  @IsOptional()
  realmId: string | null;

  @ApiProperty({ description: 'Item category', example: 'weapon' })
  @IsString()
  @IsNotEmpty()
  category!: ItemCategory;

  @ApiProperty({ description: 'Weapon info if available' })
  @IsObject()
  @IsOptional()
  weapon!: ItemWeaponDto | null;

  @ApiProperty({ description: 'Armor info if available' })
  @IsObject()
  @IsOptional()
  armor!: ItemArmorDto | null;

  @ApiProperty({ description: 'Shield info if available' })
  @IsObject()
  @IsOptional()
  shield!: ItemShieldDto | null;

  @ApiProperty({ description: 'Generic item information' })
  @IsObject()
  info!: ItemInfoDto;

  @ApiProperty({ description: 'Item modifiers', required: false, isArray: true, type: () => ItemModifierDto })
  @IsOptional()
  modifiers: ItemModifierDto[] | null;

  @ApiProperty({ description: 'Item description', example: 'Some item description' })
  @IsString()
  @IsOptional()
  description: string | null;

  @ApiProperty({ description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | null;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    return new CreateItemCommand(
      dto.id,
      dto.name ?? dto.id,
      dto.realmId,
      dto.category,
      dto.weapon ? ItemWeaponDto.toEntity(dto.weapon) : null,
      dto.armor ? ItemArmorDto.toEntity(dto.armor) : null,
      dto.shield ? ItemShieldDto.toEntity(dto.shield) : null,
      ItemInfoDto.toEntity(dto.info),
      dto.modifiers ? dto.modifiers.map(m => ItemModifierDto.toEntity(m)) : null,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
