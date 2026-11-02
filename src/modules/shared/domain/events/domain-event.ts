/** The service that publishes the events (spec 021, decision 10): its Kafka client id. No consumer reads it. */
const PRODUCER_FALLBACK = 'rmu-api-items';

export class DomainEvent<E> {
  public readonly eventType: string;
  public readonly eventVersion: string;
  public readonly eventTime: Date;
  public readonly producer: string;
  public readonly data: E;

  constructor(eventType: string, data: E) {
    this.eventType = eventType;
    this.eventVersion = '1';
    this.eventTime = new Date();
    this.producer = process.env.RMU_KAFKA_CLIENT_ID || PRODUCER_FALLBACK;
    this.data = data;
  }
}
