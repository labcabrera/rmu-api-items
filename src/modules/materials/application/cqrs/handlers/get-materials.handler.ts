import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from '../../../../shared/domain/errors/errors.js';
import { checkCoreLawAccess } from '../../../../shared/domain/services/core-law-access.js';
import type { Material } from '../../../domain/value-objects/material.vo.js';
import { MATERIAL_REPOSITORY, type MaterialRepository } from '../../ports/material-repository.port.js';
import { GetMaterialQuery, GetMaterialsQuery } from '../queries/get-materials.query.js';

/** Rulebook content: the same access as the Core Law tables (workspace spec 043, decision 1). */
@QueryHandler(GetMaterialsQuery)
export class GetMaterialsHandler implements IQueryHandler<GetMaterialsQuery, Material[]> {
  constructor(@Inject(MATERIAL_REPOSITORY) private readonly repository: MaterialRepository) {}

  async execute(query: GetMaterialsQuery): Promise<Material[]> {
    checkCoreLawAccess(query.roles);
    return this.repository.findAll();
  }
}

@QueryHandler(GetMaterialQuery)
export class GetMaterialHandler implements IQueryHandler<GetMaterialQuery, Material> {
  constructor(@Inject(MATERIAL_REPOSITORY) private readonly repository: MaterialRepository) {}

  async execute(query: GetMaterialQuery): Promise<Material> {
    checkCoreLawAccess(query.roles);
    const material = await this.repository.findById(query.id);
    if (!material) throw new NotFoundError('Material', query.id);
    return material;
  }
}
