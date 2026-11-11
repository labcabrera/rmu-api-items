import { ApiProperty } from '@nestjs/swagger';
import { ItemArmorDto } from './item-armor.dto.js';
import { ItemInfoDto } from './item-info.dto.js';
import { ItemShieldDto } from './item-shield.dto.js';
import { ItemFeaturesDto } from './item-features.dto.js';
import { ItemWeaponDto } from './item-weapon.dto.js';
import { ItemModifierDto } from './item-modifier.dto.js';
import type { ItemCategory } from '../../../domain/value-objects/item-category.vo.js';
import { Item } from '../../../domain/aggregates/item.aggregate.js';
import { PaginationDto } from '../../../../shared/interfaces/http/dto/page.dto.js';
import type { ItemAccess } from '../../../domain/services/realm-child-access.js';
import type { ItemWithAccess } from '../../../application/cqrs/item-with-access.js';
import { ENTITY_SOURCES, type EntitySource } from '../../../../shared/domain/entities/entity-source.js';

export class ItemDto {
  @ApiProperty({ description: 'Item identifier', example: 'dagger' })
  id: string;

  @ApiProperty({ type: String, description: 'Item name', required: false })
  name: string | null;

  @ApiProperty({ type: String, description: 'Realm id', required: false })
  realmId: string | null;

  @ApiProperty({ type: String, description: 'Item category', example: 'weapon' })
  category!: ItemCategory;

  @ApiProperty({ description: 'Weapon info if available' })
  weapon: ItemWeaponDto | null;

  @ApiProperty({ description: 'Armor info if available' })
  armor: ItemArmorDto | null;

  @ApiProperty({ description: 'Shield info if available' })
  shield: ItemShieldDto | null;

  @ApiProperty({ type: ItemFeaturesDto, description: 'Category blocks (specs 041, 042, 062)', required: false })
  features: ItemFeaturesDto | null;

  @ApiProperty({ description: 'Generic item information' })
  info: ItemInfoDto;

  @ApiProperty({ description: 'Item modifiers', required: false, isArray: true, type: () => ItemModifierDto })
  modifiers: ItemModifierDto[] | null;

  @ApiProperty({ type: String, description: 'Item description', example: 'Some item description' })
  description: string | null;

  @ApiProperty({ type: String, description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  imageUrl: string | null;

  @ApiProperty({ description: 'Owner of the item', example: 'user123' })
  owner: string;

  @ApiProperty({ enum: ENTITY_SOURCES, description: 'Rulebook (system, admin only) or user content (spec 063)', example: 'system' })
  entitySource: EntitySource;

  @ApiProperty({
    enum: ['manage', 'write', 'read'],
    description: 'What the caller can do with the item (spec 073): write changes and deletes it, read only reads it',
    example: 'write',
  })
  access: ItemAccess;

  @ApiProperty({ description: 'Version of optimistic concurrency: send it back in the PATCH to detect a concurrent change', example: 0 })
  version: number;

  static fromEntity(entity: Item, access: ItemAccess): ItemDto {
    const dto = new ItemDto();
    dto.id = entity.id;
    dto.version = entity.version;
    dto.name = entity.name ? entity.name : entity.id;
    dto.realmId = entity.realmId ? entity.realmId : null;
    dto.category = entity.category;
    dto.weapon = entity.weapon ? ItemWeaponDto.fromEntity(entity.weapon) : null;
    dto.armor = entity.armor ? ItemArmorDto.fromEntity(entity.armor) : null;
    dto.shield = entity.shield ? ItemShieldDto.fromEntity(entity.shield) : null;
    dto.features = ItemFeaturesDto.fromEntity(entity.features);
    dto.info = ItemInfoDto.fromEntity(entity.info);
    dto.modifiers = entity.modifiers ? entity.modifiers.map(m => ItemModifierDto.fromEntity(m)) : null;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    dto.owner = entity.owner;
    dto.entitySource = entity.entitySource;
    dto.access = access;
    return dto;
  }

  static fromResult(result: ItemWithAccess): ItemDto {
    return ItemDto.fromEntity(result.item, result.access);
  }
}

export class ItemPageDto {
  @ApiProperty({ type: [ItemDto], description: 'Items' })
  content!: ItemDto[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination!: PaginationDto;
}
