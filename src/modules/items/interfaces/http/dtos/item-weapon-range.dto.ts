import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { ItemWeaponRange } from 'src/modules/items/domain/value-objects/item-weapon-range.vo';

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
