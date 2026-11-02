import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { configureHttp } from '../../../src/bootstrap/http.js';
import { REALM_PORT, type Realm, type RealmPort } from '../../../src/modules/items/application/ports/realm.port.js';
import { KafkaProducerService } from '../../../src/modules/shared/infrastructure/messaging/kafka-producer.service.js';
import { AUDIENCE, ISSUER, LocalJwks } from './jwks.js';

export type Server = Parameters<typeof request>[0];

/** The users of the suite, by the Keycloak groups in their token. */
export const USERS = {
  admin: { sub: 'e2e-admin', groups: ['rmu-admin'] },
  owner: { sub: 'e2e-owner', groups: ['rmu-user'] },
  other: { sub: 'e2e-other', groups: ['rmu-user'] },
  noRole: { sub: 'e2e-guest', groups: [] as string[] },
} as const;

export type UserName = keyof typeof USERS;

/** A message the API sent to Kafka. */
export type SentEvent = { topic: string; message: { eventType: string; producer: string; data: { id: string } & Record<string, unknown> } };

/** The realms core knows about in the suite; any other id answers 404 (null). */
export const REALMS = new Map<string, Realm>([['e2e-realm', { id: 'e2e-realm', name: 'E2E realm' }]]);

export type E2eApp = {
  app: NestExpressApplication;
  server: Server;
  jwks: LocalJwks;
  /** Every message sent to Kafka, in order. */
  events: SentEvent[];
  /** The realm ids the realm port was asked for, in order. */
  realmLookups: string[];
  auth: (user: UserName) => string;
  connection: Connection;
  stop: () => Promise<void>;
};

/**
 * Boots the whole AppModule as main.ts does (configureHttp) against an in-memory Mongo and a local JWKS. The Kafka
 * producer records what it would send (so the topics are checked), and the realm port of core answers from REALMS.
 * AppModule is imported after setting the environment, because ConfigModule.forRoot() reads it when the module is
 * evaluated.
 */
export async function startApp(env: Record<string, string> = {}): Promise<E2eApp> {
  const mongo = await MongoMemoryServer.create();
  const jwks = new LocalJwks();
  await jwks.start();
  Object.assign(process.env, {
    RMU_MONGO_ITEMS_URI: mongo.getUri('rmu-items-e2e'),
    RMU_API_CORE_URI: 'http://localhost:1/v1',
    RMU_IAM_JWK_URI: jwks.uri,
    RMU_IAM_ISSUER_URI: ISSUER,
    RMU_IAM_AUDIENCE: AUDIENCE,
    RMU_IAM_TOKEN_URI: 'http://localhost:1/token',
    RMU_IAM_CLIENT_ID: 'rmu-api-items-e2e',
    RMU_IAM_CLIENT_SECRET: 'e2e',
    RMU_KAFKA_BROKERS: 'localhost:9092',
    RMU_KAFKA_CLIENT_ID: 'rmu-api-items-e2e',
    RMU_KAFKA_CONSUMER_GROUP_ID: 'rmu-api-items-e2e',
    RMU_THROTTLE_LIMIT: '0',
    RMU_CORS_ORIGINS: '',
    ...env,
  });

  const events: SentEvent[] = [];
  const realmLookups: string[] = [];
  const realmPort: RealmPort = {
    fetchRealmById: (realmId: string) => {
      realmLookups.push(realmId);
      return Promise.resolve(REALMS.get(realmId) ?? null);
    },
  };
  const { AppModule } = await import('../../../src/app.module.js');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(KafkaProducerService)
    .useValue({
      emit: (topic: string, message: SentEvent['message']) => {
        events.push({ topic, message: JSON.parse(JSON.stringify(message)) as SentEvent['message'] });
        return Promise.resolve();
      },
    })
    .overrideProvider(REALM_PORT)
    .useValue(realmPort)
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: ['error'] });
  configureHttp(app);
  await app.init();

  return {
    app,
    server: app.getHttpServer() as Server,
    jwks,
    events,
    realmLookups,
    auth: user => `Bearer ${jwks.token(USERS[user])}`,
    connection: app.get<Connection>(getConnectionToken()),
    stop: async () => {
      await app.close();
      await jwks.stop();
      await mongo.stop();
    },
  };
}

/** The ids of a page response. */
export const ids = (body: unknown) => (body as { content: { id: string }[] }).content.map(item => item.id);
