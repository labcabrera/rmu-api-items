import { ApiProperty } from '@nestjs/swagger';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';
import { ItemModifierDto } from './item-modifier.dto';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';
import { NamedEntityDto } from 'src/modules/shared/interfaces/http/dto/named-entity.dto';
import { PaginationDto } from 'src/modules/shared/interfaces/http/dto/page.dto';

export class ItemDto {
  @ApiProperty({ description: 'Item identifier', example: 'dagger' })
  id: string;

  @ApiProperty({ description: 'Item name', required: false })
  name: string | null;

  @ApiProperty({ description: 'Realm id', required: false })
  realmId: string | null;

  @ApiProperty({ description: 'Item category', example: 'weapon' })
  category!: ItemCategory;

  @ApiProperty({ description: 'Weapon info if available' })
  weapon: ItemWeaponDto | null;

  @ApiProperty({ description: 'Armor info if available' })
  armor: ItemArmorDto | null;

  @ApiProperty({ description: 'Shield info if available' })
  shield: ItemShieldDto | null;

  @ApiProperty({ description: 'Generic item information' })
  info: ItemInfoDto;

  @ApiProperty({ description: 'Item modifiers', required: false, isArray: true, type: () => ItemModifierDto })
  modifiers: ItemModifierDto[] | null;

  @ApiProperty({ description: 'Item description', example: 'Some item description' })
  description: string | null;

  @ApiProperty({ description: 'Image URL for the item', example: 'https://example.com/image.png', required: false })
  imageUrl: string | null;

  @ApiProperty({ description: 'Owner of the item', example: 'user123' })
  owner: string;

  static fromEntity(entity: Item): ItemDto {
    const dto = new ItemDto();
    dto.id = entity.id;
    dto.name = (entity as any).name ? (entity as any).name : entity.id;
    dto.realmId = (entity as any).realmId ? (entity as any).realmId : null;
    dto.category = entity.category;
    dto.weapon = entity.weapon ? ItemWeaponDto.fromEntity(entity.weapon) : null;
    dto.armor = entity.armor ? ItemArmorDto.fromEntity(entity.armor) : null;
    dto.shield = entity.shield ? ItemShieldDto.fromEntity(entity.shield) : null;
    dto.info = ItemInfoDto.fromEntity(entity.info);
    dto.modifiers = entity.modifiers ? entity.modifiers.map(m => ItemModifierDto.fromEntity(m)) : null;
    dto.description = entity.description;
    dto.imageUrl = entity.imageUrl;
    dto.owner = entity.owner;
    return dto;
  }
}

export class ItemPageDto {
  @ApiProperty({
    type: [ItemDto],
    description: 'Items',
    isArray: true,
  })
  content!: ItemDto[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination!: PaginationDto;
}
