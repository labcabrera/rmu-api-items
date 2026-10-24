import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { ConfigService } from '@nestjs/config';
import {
  HttpClient,
  isUpstreamHttpError,
  UpstreamBadGatewayError,
  UpstreamValidationError,
} from '../../../../src/modules/shared/infrastructure/http/http-client.js';
import { BadGatewayError, GatewayTimeoutError, ValidationError } from '../../../../src/modules/shared/domain/errors/errors.js';

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

/** A local server whose answer each test sets (spec 021, decision 7). */
let handler: Handler;
let server: Server;
let base: string;

beforeAll(async () => {
  server = createServer((req, res) => handler(req, res));
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>(resolve => server.close(() => resolve()));
});

const client = (timeoutMs = 1000) => new HttpClient(new ConfigService({ RMU_HTTP_TIMEOUT_MS: timeoutMs }));
const answer = (status: number, body?: unknown) => {
  handler = (_req, res) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(body === undefined ? '' : JSON.stringify(body));
  };
};

describe('HttpClient', () => {
  it('returns the parsed body and sends the token', async () => {
    let authorization: string | undefined;
    handler = (req, res) => {
      authorization = req.headers.authorization;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'r1' }));
    };
    await expect(client().get(`${base}/realms/r1`, { token: 't0k' })).resolves.toEqual({ id: 'r1' });
    expect(authorization).toBe('Bearer t0k');
  });

  it('turns no answer in time into a 504 upstream-timeout', async () => {
    handler = () => undefined; // never answers
    const error = await client(50)
      .get(`${base}/slow`)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GatewayTimeoutError);
    expect(error).toMatchObject({ statusCode: 504, code: 'upstream-timeout' });
    expect((error as Error).message).toBe('127.0.0.1/slow did not answer in 50 ms');
  });

  it('turns a network failure into a 502', async () => {
    // A port nobody listens on (fetch refuses port 1 before connecting).
    const closed = createServer();
    await new Promise<void>(resolve => closed.listen(0, '127.0.0.1', resolve));
    const { port } = closed.address() as AddressInfo;
    await new Promise<void>(resolve => closed.close(() => resolve()));
    const error = await client()
      .get(`http://127.0.0.1:${port}/realms/r1`)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadGatewayError);
    expect(isUpstreamHttpError(error)).toBe(false);
    expect(error).toMatchObject({ statusCode: 502, code: 'bad-gateway', message: '127.0.0.1/realms/r1 is not available (ECONNREFUSED)' });
  });

  it.each([400, 422])('turns a %i into a 400 with the status', async status => {
    answer(status, { message: ['name must be a string'] });
    const error = await client()
      .post(`${base}/realms`, { name: 1 })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UpstreamValidationError);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ statusCode: 400, status, message: `127.0.0.1/realms answered ${status}: name must be a string` });
  });

  it.each([404, 401, 500, 503])('turns a %i into a 502 with the status', async status => {
    answer(status, { message: 'Nope' });
    const error = await client()
      .get(`${base}/realms/r1`)
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UpstreamBadGatewayError);
    expect(isUpstreamHttpError(error) && error.status).toBe(status);
    expect(error).toMatchObject({ statusCode: 502, code: 'bad-gateway', message: `127.0.0.1/realms/r1 answered ${status}: Nope` });
  });

  it('accepts a body that is not JSON and an empty one', async () => {
    handler = (_req, res) => {
      res.writeHead(500);
      res.end('plain failure');
    };
    await expect(client().delete(`${base}/x`)).rejects.toMatchObject({ message: '127.0.0.1/x answered 500: plain failure' });
    answer(204);
    await expect(client().patch(`${base}/x`, {})).resolves.toBeUndefined();
    await expect(client().put(`${base}/x`, {})).resolves.toBeUndefined();
  });
});
