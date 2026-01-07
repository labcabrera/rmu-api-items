import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';
import type { ItemCategory } from 'src/modules/items/domain/value-objects/item-category.vo';
import { CreateItemCommand } from 'src/modules/items/application/cqrs/commands/create-item.command';
import { ItemWeapon as ItemWeaponVO } from 'src/modules/items/domain/value-objects/item-weapon.vo';
import { ItemWeaponMode as ItemWeaponModeVO } from 'src/modules/items/domain/value-objects/item-weapon-mode.vo';
import type { AttackTable } from 'src/modules/items/domain/value-objects/attack-table.vo';
import type { FumbleTable } from 'src/modules/items/domain/value-objects/fumble-table.vo';

export class CreateItemDto {
  @ApiProperty({ description: 'Item identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Realm identifier from core module', example: 'lotr' })
  @IsString()
  @IsNotEmpty()
  realm: string;

  @ApiProperty({ description: 'Item category', example: 'weapon' })
  @IsString()
  @IsNotEmpty()
  category: ItemCategory;

  @ApiProperty({ description: 'Weapon info if available' })
  @IsObject()
  @IsOptional()
  weapon: ItemWeaponDto | undefined;

  @ApiProperty({ description: 'Armor info if available' })
  @IsObject()
  @IsOptional()
  armor: ItemArmorDto | undefined;

  @ApiProperty({ description: 'Shield info if available' })
  @IsObject()
  @IsOptional()
  shield: ItemShieldDto | undefined;

  @ApiProperty({ description: 'Generic item information' })
  @IsObject()
  info: ItemInfoDto;

  @ApiProperty({ description: 'Is the item stackable?' })
  @IsOptional()
  @IsBoolean()
  stackable: boolean = false;

  @ApiProperty({ description: 'Item description', example: 'Some item description' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    const weapon = dto.weapon
      ? new ItemWeaponVO(
          dto.weapon.skillId,
          dto.weapon.fumble,
          (dto.weapon.modes ?? []).map(
            (m) =>
              new ItemWeaponModeVO(
                m.type,
                m.attackTable as unknown as AttackTable,
                m.fumbleTable as unknown as FumbleTable,
                m.sizeAdjustment,
                m.ranges,
                m.alternativeTable as unknown as AttackTable | undefined,
              ),
          ),
        )
      : undefined;

    return CreateItemCommand.create(
      {
        id: dto.id,
        realm: dto.realm,
        category: dto.category,
        weapon,
        armor: dto.armor,
        shield: dto.shield,
        info: dto.info,
        stackable: dto.stackable,
        description: dto.description,
        owner: userId,
      },
      userId,
      roles,
    );
  }
}
