import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Page } from 'src/modules/shared/domain/entities/page.entity';
import { RsqlParser } from 'src/modules/shared/infrastructure/messaging/rsql-parser';
import { ItemModel, ItemDocument } from '../models/item-model';
import { NotFoundError } from 'src/modules/shared/domain/errors';
import { ItemRepository } from 'src/modules/items/application/ports/out/item-repository';
import { Item } from 'src/modules/items/domain/entities/item';

@Injectable()
export class MongoItemRepository implements ItemRepository {
  constructor(
    @InjectModel(ItemModel.name) private gameModel: Model<ItemDocument>,
    private rsqlParser: RsqlParser,
  ) {}

  async findById(id: string): Promise<Item | null> {
    const readed = await this.gameModel.findById(id);
    return readed ? this.mapToEntity(readed) : null;
  }

  async findByRsql(rsql: string, page: number, size: number): Promise<Page<Item>> {
    const skip = page * size;
    const mongoQuery = this.rsqlParser.parse(rsql);
    const [gamesDocs, totalElements] = await Promise.all([
      this.gameModel.find(mongoQuery).skip(skip).limit(size).sort({ name: 1 }),
      this.gameModel.countDocuments(mongoQuery),
    ]);
    const content = gamesDocs.map((doc) => this.mapToEntity(doc));
    return new Page<Item>(content, page, size, totalElements);
  }

  async save(game: Partial<Item>): Promise<Item> {
    const model = new this.gameModel({ ...game, _id: game.id });
    await model.save();
    return this.mapToEntity(model);
  }

  async update(id: string, request: Partial<Item>): Promise<Item> {
    const updatedRace = await this.gameModel.findByIdAndUpdate(id, { $set: request }, { new: true });
    if (!updatedRace) {
      throw new NotFoundError('Race', id);
    }
    return this.mapToEntity(updatedRace);
  }

  async deleteById(id: string): Promise<Item | null> {
    const result = await this.gameModel.findByIdAndDelete(id);
    return result ? this.mapToEntity(result) : null;
  }

  private mapToEntity(doc: ItemDocument): Item {
    return {
      id: doc._id,
      realm: doc.realm,
      category: doc.category,
      weapon: doc.weapon,
      armor: doc.armor,
      shield: doc.shield,
      info: doc.info,
      description: doc.description,
      owner: doc.owner,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
