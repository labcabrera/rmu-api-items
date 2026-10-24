import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from '../../../shared/infrastructure/messaging/kafka-producer.service';
import { ItemEventBusPort } from '../../application/ports/item-event-bus.port';
import { DomainEvent } from '../../../shared/domain/events/domain-event';
import { ItemProps } from '../../domain/aggregates/item-props';

@Injectable()
export class KafkaItemEventBusAdapter implements ItemEventBusPort {
  private readonly logger = new Logger(KafkaItemEventBusAdapter.name);

  constructor(private readonly kafkaProducerService: KafkaProducerService) {}

  publish(event: DomainEvent<ItemProps>): void {
    this.kafkaProducerService.emit(`internal.rmu-items.item.${event.eventType}.v1`, event).catch(err => {
      this.logger.error('Error publishing event to Kafka', err);
    });
  }
}
