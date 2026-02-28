import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { NamedEntity } from '../../domain/entities/named-entity.vo';

export class NamedEntityDto {
  @ApiProperty({ description: 'Entity identifier', example: 'dagger' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Entity name', example: 'Dagger' })
  @IsString()
  @IsNotEmpty()
  name: string;

  static fromEntity(entity: NamedEntity): NamedEntityDto {
    const dto = new NamedEntityDto();
    dto.id = entity.id;
    dto.name = entity.name;
    return dto;
  }
}
