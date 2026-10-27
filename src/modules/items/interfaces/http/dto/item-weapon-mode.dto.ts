import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ItemWeaponMode } from '../../../domain/value-objects/item-weapon-mode.vo.js';
import { WEAPON_MODES, type WeaponMode } from '../../../domain/value-objects/weapon-mode.vo.js';
import { ItemWeaponRangeDto } from './item-weapon-range.dto.js';
import { ATTACK_TYPES, type AttackType } from '../../../domain/value-objects/attack-type.vo.js';
import type { AttackTable } from '../../../domain/value-objects/attack-table.vo.js';
import type { FumbleTable } from '../../../domain/value-objects/fumble-table.vo.js';

export class ItemWeaponModeDto {
  @ApiProperty({ type: String, enum: WEAPON_MODES, description: 'Weapon mode type', example: 'one-hand' })
  @IsIn(WEAPON_MODES)
  type: WeaponMode;

  @ApiProperty({ description: 'Attack types', required: true, type: String, enum: ATTACK_TYPES, isArray: true, example: ['melee'] })
  @IsArray()
  @IsIn(ATTACK_TYPES, { each: true })
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

  @ApiProperty({ description: 'Weapon ranges', required: false, type: [ItemWeaponRangeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemWeaponRangeDto)
  ranges: ItemWeaponRangeDto[] | undefined;

  @ApiProperty({ type: String, description: 'Alternative attack table', example: 'dagger', required: false })
  @IsOptional()
  @IsString()
  alternativeTable: AttackTable | undefined;

  @ApiProperty({
    type: Number,
    description: 'OB modifier of the mode, such as an improvised weapon penalty (spec 041)',
    required: false,
    example: -30,
  })
  @IsOptional()
  @IsNumber()
  obModifier?: number;

  static fromEntity(entity: ItemWeaponMode): ItemWeaponModeDto {
    const dto = new ItemWeaponModeDto();
    dto.type = entity.type;
    dto.attackTable = entity.attackTable;
    dto.fumbleTable = entity.fumbleTable;
    dto.sizeAdjustment = entity.sizeAdjustment;
    dto.attackTypes = entity.attackTypes;
    dto.ranges = entity.ranges?.map(range => ItemWeaponRangeDto.fromEntity(range));
    dto.alternativeTable = entity.alternativeTable;
    if (entity.obModifier) dto.obModifier = entity.obModifier;
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
      dto.obModifier || undefined,
    );
  }
}
