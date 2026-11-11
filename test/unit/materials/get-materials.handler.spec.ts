import { describe, expect, it } from 'vitest';
import { GetMaterialHandler, GetMaterialsHandler } from '../../../src/modules/materials/application/cqrs/handlers/get-materials.handler.js';
import { GetMaterialQuery, GetMaterialsQuery } from '../../../src/modules/materials/application/cqrs/queries/get-materials.query.js';
import type { MaterialRepository } from '../../../src/modules/materials/application/ports/material-repository.port.js';
import type { Material } from '../../../src/modules/materials/domain/value-objects/material.vo.js';
import { MongoMaterialRepository } from '../../../src/modules/materials/infrastructure/db/mongo.material.repository.js';
import type { MaterialModel } from '../../../src/modules/materials/infrastructure/persistence/models/material.model.js';
import { ForbiddenError, NotFoundError } from '../../../src/modules/shared/domain/errors/errors.js';

// Fixture values, not the rulebook ones
const STEEL: Material = {
  id: 'e2e-steel',
  group: 'metal',
  durability: 3,
  workability: -7,
  bonus: 4,
  bluntBonus: 2,
  metalBonus: null,
  cost: { add: 1.5, multiplier: null },
  costPerPound: 0.2,
  density: 100,
  magical: false,
  alloy: true,
  alloyDifficulty: 'h',
  armorWeightMultiplier: null,
  uses: ['weapon', 'armor'],
};

const repository = (materials: Material[]): MaterialRepository => ({
  findAll: () => Promise.resolve(materials),
  findById: (id: string) => Promise.resolve(materials.find(material => material.id === id) ?? null),
});

describe('Materials handlers', () => {
  it('lists and finds the materials for Core Law users and administrators', async () => {
    await expect(new GetMaterialsHandler(repository([STEEL])).execute(new GetMaterialsQuery('u', ['rmu-core-law']))).resolves.toEqual([
      STEEL,
    ]);
    await expect(
      new GetMaterialHandler(repository([STEEL])).execute(new GetMaterialQuery('e2e-steel', 'u', ['rmu-admin'])),
    ).resolves.toEqual(STEEL);
  });

  it('rejects users without Core Law access and unknown materials', async () => {
    await expect(new GetMaterialsHandler(repository([STEEL])).execute(new GetMaterialsQuery('u', ['rmu-user']))).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(
      new GetMaterialHandler(repository([STEEL])).execute(new GetMaterialQuery('nope', 'u', ['rmu-core-law'])),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('maps a stored document with missing optional values as null', () => {
    const doc = { _id: 'e2e-wood', group: 'wood', durability: 1, bonus: 0, cost: { multiplier: 0.5 } };
    expect(MongoMaterialRepository.mapToMaterial(doc as unknown as MaterialModel)).toEqual({
      id: 'e2e-wood',
      group: 'wood',
      durability: 1,
      workability: null,
      bonus: 0,
      bluntBonus: null,
      metalBonus: null,
      cost: { add: null, multiplier: 0.5 },
      costPerPound: null,
      density: null,
      magical: false,
      alloy: false,
      alloyDifficulty: null,
      armorWeightMultiplier: null,
      uses: [],
    });
  });
});
