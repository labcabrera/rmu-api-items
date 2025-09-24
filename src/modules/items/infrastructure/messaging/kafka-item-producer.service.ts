import { Injectable } from '@nestjs/common';

import { KafkaProducerService } from 'src/modules/shared/infrastructure/messaging/kafka-producer.service';
import { Item } from '../../domain/aggregates/item.aggregate';
import { ItemCreatedEvent, ItemDeletedEvent, ItemUpdatedEvent } from '../../domain/events/item.events';

@Injectable()
export class KafkaItemProducerService {
  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  async created(entity: Item): Promise<void> {
    const event = new ItemCreatedEvent(entity);
    await this.kafkaProducerService.emit('internal.rmu-items.item.created.v1', event);
  }
  async updated(entity: Item): Promise<void> {
    const event = new ItemUpdatedEvent(entity);
    await this.kafkaProducerService.emit('internal.rmu-items.item.updated.v1', event);
  }

  async deleted(entity: Item): Promise<void> {
    const event = new ItemDeletedEvent(entity);
    await this.kafkaProducerService.emit('internal.rmu-items.item.deleted.v1', event);
  }
}
