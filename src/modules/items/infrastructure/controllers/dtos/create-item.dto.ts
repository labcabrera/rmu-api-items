import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { CreateItemCommand } from 'src/modules/items/application/commands/create-item.command';
import * as item from 'src/modules/items/domain/entities/item';
import { ItemInfoDto, ItemWeaponDto } from './item.dto';

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
  weapon: ItemWeaponDto;

  @IsObject()
  info: ItemInfoDto;

  @ApiProperty({ description: 'Game description', example: 'A thrilling campaign set in Middle-earth' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    const cmd = new CreateItemCommand();
    cmd.id = dto.id;
    cmd.realm = dto.realm;
    cmd.category = dto.category;
    cmd.weapon = dto.weapon;
    cmd.info = ItemInfoDto.toEntity(dto.info);
    cmd.userId = userId;
    cmd.roles = roles;
    return cmd;
  }
}
