import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { MaterialRepository } from '../../application/ports/material-repository.port.js';
import type { Material } from '../../domain/value-objects/material.vo.js';
import { type MaterialDocument, MaterialModel } from '../persistence/models/material.model.js';

const orNull = <T>(value: T | null | undefined): T | null => (value === undefined ? null : value);

@Injectable()
export class MongoMaterialRepository implements MaterialRepository {
  constructor(@InjectModel(MaterialModel.name) private readonly model: Model<MaterialDocument>) {}

  async findAll(): Promise<Material[]> {
    const docs = await this.model.find().sort({ group: 1, _id: 1 }).lean<MaterialModel[]>();
    return docs.map(doc => MongoMaterialRepository.mapToMaterial(doc));
  }

  async findById(id: string): Promise<Material | null> {
    const doc = await this.model.findById(id).lean<MaterialModel>();
    return doc ? MongoMaterialRepository.mapToMaterial(doc) : null;
  }

  static mapToMaterial(doc: MaterialModel): Material {
    return {
      id: doc._id,
      group: doc.group,
      durability: doc.durability ?? 0,
      workability: orNull(doc.workability),
      bonus: doc.bonus ?? 0,
      bluntBonus: orNull(doc.bluntBonus),
      metalBonus: orNull(doc.metalBonus),
      cost: { add: orNull(doc.cost?.add), multiplier: orNull(doc.cost?.multiplier) },
      costPerPound: orNull(doc.costPerPound),
      density: orNull(doc.density),
      magical: !!doc.magical,
      alloy: !!doc.alloy,
      alloyDifficulty: orNull(doc.alloyDifficulty),
      armorWeightMultiplier: orNull(doc.armorWeightMultiplier),
      uses: [...(doc.uses ?? [])],
    };
  }
}
