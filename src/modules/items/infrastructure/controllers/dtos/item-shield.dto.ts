import { IsNumber } from 'class-validator';
import { ItemShield } from 'src/modules/items/domain/entities/item';

export class ItemShieldDto {
  @IsNumber()
  attacks: number;

  static toEntity(dto: ItemShieldDto): ItemShield {
    return {
      attacks: dto.attacks,
    };
  }
}
