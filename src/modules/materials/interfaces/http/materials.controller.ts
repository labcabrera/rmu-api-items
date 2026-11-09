import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/infrastructure/security/jwt-auth.guard.js';
import { GetMaterialQuery, GetMaterialsQuery } from '../../application/cqrs/queries/get-materials.query.js';
import type { Material } from '../../domain/value-objects/material.vo.js';
import { MaterialDto } from './dto/material.dto.js';
import type { AuthenticatedUser } from '../../../shared/interfaces/http/authenticated-request.js';
import { CurrentUser } from '../../../shared/interfaces/http/current-user.decorator.js';
import { ApiErrors } from '../../../shared/interfaces/http/api-errors.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('v1/materials')
@ApiTags('Materials')
export class MaterialsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('')
  @ApiOperation({
    operationId: 'getMaterials',
    summary: 'Get the superior materials',
    description: 'Durability, workability, bonus and cost of each material for crafting items. Requires Core Law access.',
  })
  @ApiOkResponse({ type: [MaterialDto], description: 'Success' })
  @ApiErrors({ 403: 'The user has no Core Law access' })
  async getMaterials(@CurrentUser() user: AuthenticatedUser): Promise<MaterialDto[]> {
    const materials = await this.queryBus.execute<GetMaterialsQuery, Material[]>(new GetMaterialsQuery(user.id, user.roles));
    return materials.map(material => MaterialDto.fromEntity(material));
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getMaterial', summary: 'Get a superior material', description: 'Requires Core Law access.' })
  @ApiOkResponse({ type: MaterialDto, description: 'Success' })
  @ApiErrors({ 403: 'The user has no Core Law access', 404: 'Material not found' })
  async getMaterial(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<MaterialDto> {
    const material = await this.queryBus.execute<GetMaterialQuery, Material>(new GetMaterialQuery(id, user.id, user.roles));
    return MaterialDto.fromEntity(material);
  }
}
