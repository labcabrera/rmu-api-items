import { createServer, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ConfigService } from '@nestjs/config';
import { ApiRealmAdapter } from '../../../src/modules/items/infrastructure/api-clients/api.realm.adapter.js';
import { HttpClient } from '../../../src/modules/shared/infrastructure/http/http-client.js';
import type { TokenService } from '../../../src/modules/shared/infrastructure/security/token.service.js';

let respond: (res: ServerResponse) => void;
let paths: string[];
let server: Server;
let adapter: ApiRealmAdapter;

beforeAll(async () => {
  server = createServer((req, res) => {
    paths.push(req.url ?? '');
    respond(res);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const config = new ConfigService({
    RMU_API_CORE_URI: `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`,
    RMU_HTTP_TIMEOUT_MS: 1000,
  });
  const tokens = { getToken: () => Promise.resolve('service-token') } as unknown as TokenService;
  adapter = new ApiRealmAdapter(tokens, config, new HttpClient(config));
});

beforeEach(() => {
  paths = [];
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

const answer = (status: number, body: unknown) => {
  respond = res => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  };
};

describe('ApiRealmAdapter', () => {
  it('returns the realm core answers', async () => {
    answer(200, { id: 'lotr', name: 'LotR' });
    await expect(adapter.fetchRealmById('lotr')).resolves.toEqual({ id: 'lotr', name: 'LotR' });
    expect(paths).toEqual(['/v1/realms/lotr']);
  });

  it('returns null when core answers 404', async () => {
    answer(404, { message: 'Realm x not found' });
    await expect(adapter.fetchRealmById('x')).resolves.toBeNull();
  });

  it.each([500, 401, 403])('answers 502 when core answers %i [F-items-05]', async status => {
    answer(status, { message: 'Boom' });
    await expect(adapter.fetchRealmById('lotr')).rejects.toMatchObject({ statusCode: 502, code: 'bad-gateway', status });
  });

  it('lists the realm levels of a user with the service token (spec 073)', async () => {
    answer(200, [{ realmId: 'lotr', level: 'write' }]);
    await expect(adapter.fetchUserRealms('user 1')).resolves.toEqual([{ realmId: 'lotr', level: 'write' }]);
    expect(paths).toEqual(['/v1/realms/access?userId=user%201']);
  });

  it.each([404, 500, 403])('never grants access when core answers %i to the realm levels', async status => {
    answer(status, { message: 'Boom' });
    await expect(adapter.fetchUserRealms('u1')).rejects.toMatchObject({ statusCode: 502 });
  });

  it('answers 502 when core does not answer a list of realm levels', async () => {
    answer(200, { realmId: 'lotr' });
    await expect(adapter.fetchUserRealms('u1')).rejects.toMatchObject({ statusCode: 502, code: 'bad-gateway' });
  });
});
