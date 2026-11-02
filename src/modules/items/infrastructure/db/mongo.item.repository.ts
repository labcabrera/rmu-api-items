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
      // A missing field is never system (spec 063)
      entitySource: doc.entitySource ?? 'user',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  /** Plain copies of the stored blocks (spec 041), without the Mongoose subdocuments. */
  private features(features: ItemModel['features'] | undefined): ItemFeatures | null {
    if (!features) return null;
    const result: ItemFeatures = {};
    const { container, light, transport, ammunition, poison, antidote, herb, acid, intoxicant, gem, jewelry, animal, property, magic } =
      features;
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
    // Spec 062
    if (herb)
      result.herb = {
        group: herb.group,
        biomes: [...(herb.biomes ?? [])],
        highAltitude: herb.highAltitude ?? false,
        find: herb.find,
        form: herb.form,
        prep: herb.prep,
        season: herb.season ?? null,
        effectDelay: herb.effectDelay,
        magical: herb.magical ?? false,
        addictionFactor: herb.addictionFactor ?? null,
        effects: herb.effects
          ? {
              heal: range(herb.effects.heal),
              stunRelief: herb.effects.stunRelief ?? null,
              treats: herb.effects.treats ? [...herb.effects.treats] : null,
              recoveryBonus: herb.effects.recoveryBonus ?? null,
            }
          : null,
      };
    if (acid)
      result.acid = {
        strength: acid.strength,
        splash: acid.splash ? { severity: acid.splash.severity, modifier: acid.splash.modifier } : null,
        immersion: acid.immersion
          ? { severity: acid.immersion.severity, count: acid.immersion.count, everyRounds: acid.immersion.everyRounds }
          : null,
        ingestion: acid.ingestion
          ? { level: acid.ingestion.level, penalty: acid.ingestion.penalty, perFailure: acid.ingestion.perFailure }
          : null,
        breakageMod: acid.breakageMod ?? 0,
        craftDifficulty: acid.craftDifficulty,
        targets: acid.targets ?? 'any',
      };
    if (intoxicant)
      result.intoxicant = {
        addictionFactor: intoxicant.addictionFactor ?? null,
        form: intoxicant.form ?? null,
        prep: intoxicant.prep ?? null,
      };
    if (gem)
      result.gem = {
        grade: gem.grade,
        mineral: gem.mineral,
        valuePerCarat: gem.valuePerCarat,
        hardness: range(gem.hardness),
        specificGravity: range(gem.specificGravity),
        luster: gem.luster ?? null,
        caratsPerCm: gem.caratsPerCm ?? null,
        magic: gem.magic
          ? {
              spells: gem.magic.spells ?? null,
              stats: [...(gem.magic.stats ?? [])],
              skills: gem.magic.skills ?? null,
              other: gem.magic.other ?? null,
            }
          : null,
      };
    if (jewelry)
      result.jewelry = {
        value: {
          min: jewelry.value.min,
          max: jewelry.value.max,
          dice: jewelry.value.dice ?? null,
          openEnded: jewelry.value.openEnded ?? false,
        },
        slot: jewelry.slot ?? null,
      };
    if (animal)
      result.animal = {
        npcId: animal.npcId ?? null,
        trained: animal.trained ?? false,
        stage: animal.stage,
        domesticated: animal.domesticated ?? false,
      };
    if (property) result.property = { rent: property.rent ?? null, size: property.size ?? null, height: property.height ?? null };
    // Spec 067
    if (magic)
      result.magic = {
        itemLevel: magic.itemLevel,
        kind: magic.kind,
        days: magic.days ?? null,
        standardPrice: magic.standardPrice ?? null,
        basePrice: magic.basePrice ?? null,
        attunement: magic.attunement ?? false,
        charges: magic.charges ?? null,
        realm: magic.realm ?? null,
        bonuses: (magic.bonuses ?? []).map(b => ({ kind: b.kind, value: b.value, target: b.target ?? null, against: b.against ?? null })),
        spells: (magic.spells ?? []).map(s => ({
          name: s.name,
          level: s.level,
          list: s.list ?? null,
          use: s.use,
          perDay: s.perDay ?? null,
        })),
        section: magic.section ?? null,
      };
    return Object.keys(result).length > 0 ? result : null;
  }
}
