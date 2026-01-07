import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';
import { ItemWeaponModeDto } from './item-weapon-mode.dto';

export class ItemWeaponDto {
  @ApiProperty({ description: 'Skill identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  skillId: string;

  @ApiProperty({ description: 'Fumble', example: 3 })
  @IsNumber()
  @IsNotEmpty()
  fumble: number;

  modes: ItemWeaponModeDto[];

  static fromEntity(entity: ItemWeapon): ItemWeaponDto {
    const dto = new ItemWeaponDto();
    dto.skillId = entity.skillId;
    dto.fumble = entity.fumble;
    dto.modes = entity.modes.map((e) => ItemWeaponModeDto.fromEntity(e));
    return dto;
  }

  static toEntity(dto: ItemWeaponDto): ItemWeapon {
    return new ItemWeapon(
      dto.skillId,
      dto.fumble,
      dto.modes.map((e) => ItemWeaponModeDto.toEntity(e)),
    );
  }
}
