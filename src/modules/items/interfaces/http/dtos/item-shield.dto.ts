import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { ItemShield } from 'src/modules/items/domain/value-objects/item-shield.vo';

export class ItemShieldDto {
  @ApiProperty({ description: 'Number of attacks the shield can block', example: 1 })
  @IsNumber()
  attacks: number;

  static fromEntity(entity: ItemShield): ItemShieldDto {
    const dto = new ItemShieldDto();
    dto.attacks = entity.attacks;
    return dto;
  }

  static toEntity(dto: ItemShieldDto): ItemShield {
    return new ItemShield(dto.attacks);
  }
}
