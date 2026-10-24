import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItemWeaponMode } from '../../../domain/value-objects/item-weapon-mode.vo.js';
import type { WeaponMode } from '../../../domain/value-objects/weapon-mode.vo.js';
import { ItemWeaponRangeDto } from './item-weapon-range.dto.js';
import type { AttackType } from '../../../domain/value-objects/attack-type.vo.js';
import type { AttackTable } from '../../../domain/value-objects/attack-table.vo.js';
import type { FumbleTable } from '../../../domain/value-objects/fumble-table.vo.js';

export class ItemWeaponModeDto {
  @ApiProperty({ type: String, description: 'Weapon mode type', example: 'one-hand' })
  @IsString()
  @IsNotEmpty()
  type: WeaponMode;

  @ApiProperty({ description: 'Attack types', required: true })
  @IsArray()
  attackTypes: AttackType[];

  @ApiProperty({ type: String, description: 'Attack table', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  attackTable: AttackTable;

  @ApiProperty({ type: String, description: 'Fumble table', example: 'dagger' })
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

  @ApiProperty({ type: String, description: 'Alternative attack table', example: 'dagger', required: false })
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
