import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateItemCommand } from 'src/modules/items/application/commands/update-item.command';

export class UpdateItemDto {
  @ApiProperty({ description: 'Realm', example: 'lotr' })
  @IsString()
  @IsOptional()
  realm: string;

  @ApiProperty({ description: 'Item description', example: 'Some description.' })
  @IsString()
  @IsOptional()
  description: string | undefined;

  static toCommand(itemId: string, dto: UpdateItemDto, userId: string, roles: string[]): UpdateItemCommand {
    const cmd = new UpdateItemCommand();
    cmd.id = itemId;
    cmd.realm = dto.realm;
    cmd.description = dto.description;
    cmd.userId = userId;
    cmd.roles = roles;
    return cmd;
  }
}
