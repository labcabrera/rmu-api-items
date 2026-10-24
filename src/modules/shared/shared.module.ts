import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './infrastructure/security/auth.module';
import { KafkaProducerService } from './infrastructure/messaging/kafka-producer.service';
import { HealthController } from './interfaces/http/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RsqlParser } from './infrastructure/db/rsql-parser';
import { KafkaDomainEventPublisher } from './infrastructure/messaging/kafka.domain-event.publisher';
import { DOMAIN_EVENT_PUBLISHER } from './application/ports/domain-event-publisher.port';

@Module({
  imports: [TerminusModule, CqrsModule, ConfigModule, AuthModule],
  controllers: [HealthController],
  providers: [RsqlParser, KafkaProducerService, { provide: DOMAIN_EVENT_PUBLISHER, useClass: KafkaDomainEventPublisher }],
  exports: [RsqlParser, KafkaProducerService, DOMAIN_EVENT_PUBLISHER],
})
export class SharedModule {}
