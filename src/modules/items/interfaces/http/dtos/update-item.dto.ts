import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UpdateItemCommand } from 'src/modules/items/application/cqrs/commands/update-item.command';

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
    return new UpdateItemCommand(itemId, dto.realm, undefined, dto.description, userId, roles);
  }
}
