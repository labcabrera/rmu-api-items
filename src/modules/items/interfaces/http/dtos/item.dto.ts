import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/modules/shared/infrastructure/controller/dto';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';
import { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { Item } from 'src/modules/items/domain/aggregates/item.aggregate';

export class ItemDto {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeaponDto | undefined;
  armor: ItemArmorDto | undefined;
  shield: ItemShieldDto | undefined;
  info: ItemInfoDto;
  stackable: boolean | undefined;
  description: string | undefined;
  owner: string;

  static fromEntity(entity: Item): ItemDto {
    const dto = new ItemDto();
    dto.id = entity.id;
    dto.realm = entity.realm;
    dto.category = entity.category;
    dto.weapon = entity.weapon ? ItemWeaponDto.fromEntity(entity.weapon) : undefined;
    dto.armor = entity.armor ? ItemArmorDto.fromEntity(entity.armor) : undefined;
    dto.shield = entity.shield;
    dto.info = ItemInfoDto.fromEntity(entity.info);
    dto.stackable = entity.stackable;
    dto.description = entity.description;
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
  content: ItemDto[];
  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination: PaginationDto;
}
