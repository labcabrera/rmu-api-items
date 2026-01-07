import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItemWeaponMode } from 'src/modules/items/domain/value-objects/item-weapon-mode.vo';
import type { WeaponMode } from 'src/modules/items/domain/value-objects/weapon-mode.vo';
import { ItemWeaponRangeDto } from './item-weapon-range.dto';

export class ItemWeaponModeDto {
  @ApiProperty({ description: 'Weapon mode type', example: 'one-hand' })
  @IsString()
  @IsNotEmpty()
  type: WeaponMode;

  @ApiProperty({ description: 'Attack table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  attackTable: string;

  @ApiProperty({ description: 'Fumble table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  fumbleTable: string;

  @ApiProperty({ description: 'Size adjustment', example: 0 })
  @IsNumber()
  @IsNotEmpty()
  sizeAdjustment: number;

  @ApiProperty({ description: 'Weapon ranges', required: false })
  @IsOptional()
  @IsArray()
  ranges: ItemWeaponRangeDto[] | undefined;

  @ApiProperty({ description: 'Alternative attack table', example: 'dagger', required: false })
  @IsOptional()
  @IsString()
  alternativeTable: string | undefined;

  static fromEntity(entity: ItemWeaponMode): ItemWeaponModeDto {
    const dto = new ItemWeaponModeDto();
    dto.type = entity.type;
    dto.attackTable = entity.attackTable;
    dto.fumbleTable = entity.fumbleTable;
    dto.sizeAdjustment = entity.sizeAdjustment;
    dto.ranges = entity.ranges?.map((range) => ItemWeaponRangeDto.fromEntity(range));
    dto.alternativeTable = entity.alternativeTable;
    return dto;
  }
}
