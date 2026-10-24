import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ItemWeapon } from '../../../domain/value-objects/item-weapon.vo.js';
import { ItemWeaponModeDto } from './item-weapon-mode.dto.js';

export class ItemWeaponDto {
  @ApiProperty({ description: 'Skill identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({ description: 'Fumble', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  fumble: number;

  @ApiProperty({ description: 'Attack modes (at least one)', type: [ItemWeaponModeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemWeaponModeDto)
  modes: ItemWeaponModeDto[];

  static fromEntity(entity: ItemWeapon): ItemWeaponDto {
    const dto = new ItemWeaponDto();
    dto.skillId = entity.skillId;
    dto.fumble = entity.fumble;
    dto.modes = entity.modes.map(e => ItemWeaponModeDto.fromEntity(e));
    return dto;
  }

  static toEntity(dto: ItemWeaponDto): ItemWeapon {
    return new ItemWeapon(
      dto.skillId,
      dto.fumble,
      dto.modes.map(e => ItemWeaponModeDto.toEntity(e)),
    );
  }
}
