import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ItemRepository } from '../../application/ports/item-repository.port.js';
import { Item } from '../../domain/aggregates/item.aggregate.js';
import { ItemWeapon } from '../../domain/value-objects/item-weapon.vo.js';
import { ItemWeaponMode } from '../../domain/value-objects/item-weapon-mode.vo.js';
import { ItemModifier } from '../../domain/value-objects/item-modifier.vo.js';
import type { ItemFeatures } from '../../domain/value-objects/item-features.vo.js';
import { type ItemDocument, ItemModel } from '../persistence/models/item.model.js';
import { MongoBaseRepository } from '../../../shared/infrastructure/db/mongo.base.repository.js';
import { RsqlParser } from '../../../shared/infrastructure/db/rsql-parser.js';

@Injectable()
export class MongoItemRepository extends MongoBaseRepository<Item, ItemModel> implements ItemRepository {
  constructor(@InjectModel(ItemModel.name) itemModel: Model<ItemModel>, rsqlParser: RsqlParser) {
    super(itemModel, rsqlParser);
  }

  protected mapToEntity(doc: ItemDocument): Item {
    const weapon = doc.weapon
      ? new ItemWeapon(
          doc.weapon.skillId,
          doc.weapon.fumble,
          (doc.weapon.modes ?? []).map(
            m =>
              new ItemWeaponMode(
                m.type,
                m.attackTypes,
                m.attackTable,
                m.fumbleTable,
                m.sizeAdjustment,
                m.ranges,
                m.alternativeTable,
                m.obModifier || undefined,
              ),
          ),
          [...(doc.weapon.tags ?? [])],
        )
      : null;
    const modifiers = doc.modifiers ? doc.modifiers.map(m => new ItemModifier(m.id, m.type, m.modifier, m.value)) : null;
    return Item.fromProps({
      id: doc._id,
      name: doc.name,
      realmId: doc.realmId,
      category: doc.category,
      weapon: weapon,
      armor: doc.armor,
      shield: doc.shield,
      features: this.features(doc.features),
      info: doc.info,
      description: doc.description,
      modifiers: modifiers,
      imageUrl: doc.imageUrl,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Plain copies of the stored blocks (spec 041), without the Mongoose subdocuments. */
  private features(features: ItemModel['features'] | undefined): ItemFeatures | null {
    if (!features) return null;
    const result: ItemFeatures = {};
    const { container, light, transport, ammunition, poison, antidote } = features;
    if (container)
      result.container = {
        weight: container.weight ?? null,
        volume: container.volume ?? null,
        liquid: container.liquid ?? null,
        units: container.units ?? null,
      };
    if (light) result.light = { radius: light.radius ?? null, durationHours: light.durationHours ?? null };
    if (transport) result.transport = { capacity: transport.capacity ?? null, speed: transport.speed ?? null };
    if (ammunition) result.ammunition = { launchers: [...(ammunition.launchers ?? [])], sizeAdjustment: ammunition.sizeAdjustment ?? 0 };
    const range = (value?: { min: number; max: number } | null) => (value ? { min: value.min, max: value.max } : null);
    if (poison)
      result.poison = {
        category: poison.category,
        level: poison.level,
        form: poison.form,
        maxSeverity: poison.maxSeverity ?? null,
        immediateHits: range(poison.immediateHits),
        onsetRounds: range(poison.onsetRounds),
      };
    if (antidote)
      result.antidote = { categories: [...(antidote.categories ?? [])], level: antidote.level, withinHours: antidote.withinHours ?? null };
    return Object.keys(result).length > 0 ? result : null;
  }
}
