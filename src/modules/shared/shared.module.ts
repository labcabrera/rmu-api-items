import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './infrastructure/security/auth.module.js';
import { KafkaProducerService } from './infrastructure/messaging/kafka-producer.service.js';
import { HealthController } from './interfaces/http/health.controller.js';
import { TerminusModule } from '@nestjs/terminus';
import { RsqlParser } from './infrastructure/db/rsql-parser.js';
import { KafkaDomainEventPublisher } from './infrastructure/messaging/kafka.domain-event.publisher.js';
import { DOMAIN_EVENT_PUBLISHER } from './application/ports/domain-event-publisher.port.js';

@Module({
  imports: [TerminusModule, CqrsModule, ConfigModule, AuthModule],
  controllers: [HealthController],
  providers: [RsqlParser, KafkaProducerService, { provide: DOMAIN_EVENT_PUBLISHER, useClass: KafkaDomainEventPublisher }],
  exports: [RsqlParser, KafkaProducerService, DOMAIN_EVENT_PUBLISHER],
})
export class SharedModule {}
