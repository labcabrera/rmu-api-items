import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Item, ItemArmor, ItemCategory, ItemWeapon } from 'src/modules/items/domain/entities/item';
import { PaginationDto } from 'src/modules/shared/infrastructure/controller/dto';

export class ItemDto {
  id: string;
  realm: string;
  category: ItemCategory;
  weapon: ItemWeaponDto | undefined;
  armor: ItemArmorDto | undefined;
  description: string | undefined;
  owner: string;

  static fromEntity(entity: Item): ItemDto {
    const dto = new ItemDto();
    dto.id = entity.id;
    dto.realm = entity.realm;
    dto.weapon = entity.weapon ? ItemWeaponDto.fromEntity(entity.weapon) : undefined;
    dto.armor = entity.armor ? ItemArmorDto.fromEntity(entity.armor) : undefined;
    dto.description = entity.description;
    dto.owner = entity.owner;
    return dto;
  }
}

export class ItemWeaponDto {
  @ApiProperty({ description: 'Attack table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  attackTable: string;

  static fromEntity(entity: ItemWeapon): ItemWeaponDto {
    const dto = new ItemWeaponDto();
    dto.attackTable = entity.attackTable;
    //TODO
    return dto;
  }
}

export class ItemArmorDto {
  @ApiProperty({ description: 'Armor slot', type: String, example: 'chest' })
  slot: string;

  @ApiProperty({ description: 'Armor type', type: Number, example: 5 })
  @IsNumber()
  at: number;

  static fromEntity(entity: ItemArmor): ItemArmorDto {
    const dto = new ItemArmorDto();
    dto.slot = entity.slot;
    dto.at = entity.at;
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
