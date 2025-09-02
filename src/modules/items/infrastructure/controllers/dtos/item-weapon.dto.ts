import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ItemWeapon, ItemWeaponRange } from '../../persistence/models/item-childs.model';

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
