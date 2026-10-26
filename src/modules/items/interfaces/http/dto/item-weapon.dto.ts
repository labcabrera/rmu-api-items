import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
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

  @ApiProperty({
    description: 'Tags of the weapon type that its skill does not tell, read by the fighting styles (spec 032)',
    example: ['fencing'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Matches(/^[a-z0-9-]{1,50}$/, { each: true })
  tags?: string[];

  static fromEntity(entity: ItemWeapon): ItemWeaponDto {
    const dto = new ItemWeaponDto();
    dto.skillId = entity.skillId;
    dto.fumble = entity.fumble;
    dto.modes = entity.modes.map(e => ItemWeaponModeDto.fromEntity(e));
    dto.tags = [...(entity.tags ?? [])];
    return dto;
  }

  static toEntity(dto: ItemWeaponDto): ItemWeapon {
    return new ItemWeapon(
      dto.skillId,
      dto.fumble,
      dto.modes.map(e => ItemWeaponModeDto.toEntity(e)),
      [...new Set(dto.tags ?? [])],
    );
  }
}
