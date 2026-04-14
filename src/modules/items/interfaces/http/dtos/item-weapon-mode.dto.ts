import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItemWeaponMode } from 'src/modules/items/domain/value-objects/item-weapon-mode.vo';
import type { WeaponMode } from 'src/modules/items/domain/value-objects/weapon-mode.vo';
import { ItemWeaponRangeDto } from './item-weapon-range.dto';
import type { AttackType } from 'src/modules/items/domain/value-objects/attack-type.vo';
import type { AttackTable } from 'src/modules/items/domain/value-objects/attack-table.vo';
import type { FumbleTable } from 'src/modules/items/domain/value-objects/fumble-table.vo';

export class ItemWeaponModeDto {
  @ApiProperty({ description: 'Weapon mode type', example: 'one-hand' })
  @IsString()
  @IsNotEmpty()
  type: WeaponMode;

  @ApiProperty({ description: 'Attack types', required: true })
  @IsArray()
  attackTypes: AttackType[];

  @ApiProperty({ description: 'Attack table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  attackTable: AttackTable;

  @ApiProperty({ description: 'Fumble table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  fumbleTable: FumbleTable;

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
  alternativeTable: AttackTable | undefined;

  static fromEntity(entity: ItemWeaponMode): ItemWeaponModeDto {
    const dto = new ItemWeaponModeDto();
    dto.type = entity.type;
    dto.attackTable = entity.attackTable;
    dto.fumbleTable = entity.fumbleTable;
    dto.sizeAdjustment = entity.sizeAdjustment;
    dto.attackTypes = entity.attackTypes;
    dto.ranges = entity.ranges?.map(range => ItemWeaponRangeDto.fromEntity(range));
    dto.alternativeTable = entity.alternativeTable;
    return dto;
  }

  static toEntity(dto: ItemWeaponModeDto): ItemWeaponMode {
    return new ItemWeaponMode(
      dto.type,
      dto.attackTypes,
      dto.attackTable,
      dto.fumbleTable,
      dto.sizeAdjustment,
      dto.ranges?.map(range => ItemWeaponRangeDto.toEntity(range)),
      dto.alternativeTable,
    );
  }
}
