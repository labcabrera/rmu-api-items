import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { CreateItemCommand } from 'src/modules/items/application/commands/create-item.command';
import * as item from 'src/modules/items/domain/entities/item';
import { ItemArmorDto } from './item-armor.dto';
import { ItemInfoDto } from './item-info.dto';
import { ItemShieldDto } from './item-shield.dto';
import { ItemWeaponDto } from './item-weapon.dto';

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
  category: item.ItemCategory;

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
    const cmd = new CreateItemCommand();
    cmd.id = dto.id;
    cmd.realm = dto.realm;
    cmd.category = dto.category;
    cmd.weapon = dto.weapon;
    cmd.armor = dto.armor ? ItemArmorDto.toEntity(dto.armor) : undefined;
    cmd.shield = dto.shield ? ItemShieldDto.toEntity(dto.shield) : undefined;
    cmd.stackable = dto.stackable;
    cmd.info = ItemInfoDto.toEntity(dto.info);
    cmd.userId = userId;
    cmd.roles = roles;
    return cmd;
  }
}
