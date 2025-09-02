import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Item, ItemArmor, ItemCategory, ItemInfo, ItemWeapon } from 'src/modules/items/domain/entities/item';
import { PaginationDto } from 'src/modules/shared/infrastructure/controller/dto';
import { ItemWeaponRange } from '../../persistence/models/item-childs.model';

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

  @ApiProperty({ description: 'Fumble table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  fumbleTable: string;

  @ApiProperty({ description: 'Skill identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({ description: 'Fumble', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  fumble: number;

  @ApiProperty({ description: 'Size adjustment', example: 0 })
  @IsNumber()
  @IsNotEmpty()
  sizeAdjustment: number;

  @ApiProperty({ description: 'Required hands', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  requiredHands: number;

  @ApiProperty({ description: 'Is throwable weapon', example: true })
  @IsBoolean()
  @IsNotEmpty()
  throwable: boolean;

  ranges: ItemWeaponRangeDto[] | undefined;

  static fromEntity(entity: ItemWeapon): ItemWeaponDto {
    const dto = new ItemWeaponDto();
    dto.attackTable = entity.attackTable;
    dto.fumbleTable = entity.fumbleTable;
    dto.skillId = entity.skillId;
    dto.fumble = entity.fumble;
    dto.sizeAdjustment = entity.sizeAdjustment;
    dto.requiredHands = entity.requiredHands;
    dto.throwable = entity.throwable;
    return dto;
  }
}

export class ItemWeaponRangeDto {
  @ApiProperty({ description: 'From range', example: 9.9 })
  @IsNumber()
  @IsNotEmpty()
  from: number;

  @ApiProperty({ description: 'To range', example: 20.0 })
  @IsNumber()
  @IsNotEmpty()
  to: number;

  @ApiProperty({ description: 'Penalty bonus', example: -20 })
  @IsNumber()
  @IsNotEmpty()
  bonus: number;

  static fromEntity(entity: ItemWeaponRange): ItemWeaponRangeDto {
    const dto = new ItemWeaponRangeDto();
    dto.from = entity.from;
    dto.to = entity.to;
    dto.bonus = entity.bonus;
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

export class ItemInfoDto {
  @IsOptional()
  @IsNumber()
  cost: number | undefined;

  static toEntity(dto: ItemInfoDto): ItemInfo {
    return {
      cost: dto.cost,
      length: 0,
      weight: 0,
      strength: 0,
      productionHours: 0,
    };
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
