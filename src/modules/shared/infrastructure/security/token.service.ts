import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readBody, sendRequest, upstreamError } from '../http/http-client.js';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/** Service token (client credentials) for the calls to other APIs, cached until 10 s before it expires. */
@Injectable()
export class TokenService {
  private token: string | null = null;
  private expiresAt = 0;

  constructor(private readonly configService: ConfigService) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.expiresAt) return this.token;

    const uri = this.configService.get<string>('RMU_IAM_TOKEN_URI')!;
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.configService.get<string>('RMU_IAM_CLIENT_ID')!);
    params.append('client_secret', this.configService.get<string>('RMU_IAM_CLIENT_SECRET')!);

    // Without a service token no call to the other APIs can work: a failure reports Keycloak's answer (spec 021).
    const response = await sendRequest(
      uri,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params },
      Number(this.configService.get<number>('RMU_HTTP_TIMEOUT_MS') ?? 10_000),
    );
    const data = await readBody(response);
    if (!response.ok) throw upstreamError(uri, response.status, response.statusText, data);
    const { access_token, expires_in } = data as TokenResponse;
    this.token = access_token;
    this.expiresAt = now + expires_in * 1000 - 10_000;
    return this.token;
  }
}
