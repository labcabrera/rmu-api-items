import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateItemCommand } from 'src/modules/items/application/commands/create-item.command';

export class CreateItemDto {
  @ApiProperty({ description: 'Item identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Realm identifier from core module', example: 'lotr' })
  @IsString()
  @IsNotEmpty()
  realm: string;

  @ApiProperty({ description: 'Game description', example: 'A thrilling campaign set in Middle-earth' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  static toCommand(dto: CreateItemDto, userId: string, roles: string[]): CreateItemCommand {
    const cmd = new CreateItemCommand();
    cmd.id = dto.id;
    cmd.realm = dto.realm;
    //TODO
    cmd.userId = userId;
    cmd.roles = roles;
    return cmd;
  }
}
