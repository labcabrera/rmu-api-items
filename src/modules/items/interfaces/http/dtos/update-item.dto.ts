import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';
import { UpdateItemCommand } from 'src/modules/items/application/cqrs/commands/update-item.command';
import { ItemArmor } from 'src/modules/items/domain/value-objects/item-armor.vo';
import { ItemInfo } from 'src/modules/items/domain/value-objects/item-info.vo';
import { ItemShield } from 'src/modules/items/domain/value-objects/item-shield.vo';
import { ItemWeapon } from 'src/modules/items/domain/value-objects/item-weapon.vo';

export class UpdateItemDto {
  @ApiProperty({ description: 'Item weapon', required: false })
  @IsOptional()
  @IsObject()
  weapon: ItemWeapon | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  armor: ItemArmor | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  shield: ItemShield | undefined;

  @ApiProperty({ description: 'Item armor', required: false })
  @IsOptional()
  @IsObject()
  info: ItemInfo | undefined;

  @ApiProperty({ description: 'Is item stackable', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  stackable: boolean | undefined;

  @ApiProperty({ description: 'Item description', example: 'Some description.' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  static toCommand(itemId: string, dto: UpdateItemDto, userId: string, roles: string[]): UpdateItemCommand {
    return new UpdateItemCommand(itemId, dto.weapon, dto.armor, dto.shield, dto.info, dto.stackable, dto.description, userId, roles);
  }
}
