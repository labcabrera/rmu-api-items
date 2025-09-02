import { ApiProperty } from '@nestjs/swagger';
import * as item from 'src/modules/items/domain/entities/item';
import { PaginationDto } from 'src/modules/shared/infrastructure/controller/dto';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';

export class ItemDto {
  id: string;
  realm: string;
  category: item.ItemCategory;
  weapon: ItemWeaponDto | undefined;
  armor: ItemArmorDto | undefined;
  shield: ItemShieldDto | undefined;
  info: ItemInfoDto;
  description: string | undefined;
  owner: string;

  static fromEntity(entity: item.Item): ItemDto {
    const dto = new ItemDto();
    dto.id = entity.id;
    dto.realm = entity.realm;
    dto.weapon = entity.weapon ? ItemWeaponDto.fromEntity(entity.weapon) : undefined;
    dto.armor = entity.armor ? ItemArmorDto.fromEntity(entity.armor) : undefined;
    dto.shield = entity.shield;
    dto.info = ItemInfoDto.fromEntity(entity.info);
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
