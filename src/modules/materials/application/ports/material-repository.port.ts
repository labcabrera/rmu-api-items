import type { Material } from '../../domain/value-objects/material.vo.js';

export const MATERIAL_REPOSITORY = Symbol('MaterialRepository');

/** Superior materials stored in the database (collection materials, imported with data/scripts/import-materials-043.js). */
export interface MaterialRepository {
  findAll(): Promise<Material[]>;
  findById(id: string): Promise<Material | null>;
}
