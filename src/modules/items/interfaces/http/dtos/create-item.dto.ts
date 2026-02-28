import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
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
  id!: string;

  @ApiProperty({ description: 'Realm identifier from core module', example: 'lotr' })
  @IsString()
  @IsNotEmpty()
  realmId!: string;

  @ApiProperty({ description: 'Item category', example: 'weapon' })
  @IsString()
  @IsNotEmpty()
  category!: ItemCategory;

  @ApiProperty({ description: 'Weapon info if available' })
  @IsObject()
  @IsOptional()
  weapon!: ItemWeaponDto | undefined;

  @ApiProperty({ description: 'Armor info if available' })
  @IsObject()
  @IsOptional()
  armor!: ItemArmorDto | undefined;

  @ApiProperty({ description: 'Shield info if available' })
  @IsObject()
  @IsOptional()
  shield!: ItemShieldDto | undefined;

  @ApiProperty({ description: 'Generic item information' })
  @IsObject()
  info!: ItemInfoDto;

  @ApiProperty({ description: 'Is the item stackable?' })
  @IsOptional()
  @IsBoolean()
  stackable: boolean = false;

  @ApiProperty({ description: 'Item modifiers', required: false, isArray: true, type: () => ItemModifierDto })
  @IsOptional()
  modifiers: ItemModifierDto[] | undefined;

  @ApiProperty({ description: 'Item description', example: 'Some item description' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  @ApiProperty({ description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  @IsString()
  @IsOptional()
  imageUrl: string | undefined;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    return new CreateItemCommand(
      dto.id,
      dto.realmId,
      dto.category,
      dto.weapon ? ItemWeaponDto.toEntity(dto.weapon) : undefined,
      dto.armor ? ItemArmorDto.toEntity(dto.armor) : undefined,
      dto.shield ? ItemShieldDto.toEntity(dto.shield) : undefined,
      ItemInfoDto.toEntity(dto.info),
      dto.stackable,
      dto.modifiers ? dto.modifiers.map((m) => ItemModifierDto.toEntity(m)) : undefined,
      dto.description,
      dto.imageUrl,
      userId,
      roles,
    );
  }
}
