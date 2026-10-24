import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '../http/http-client.js';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/** Service token (client credentials) for the calls to other APIs, cached until 10 s before it expires. */
@Injectable()
export class TokenService {
  private token: string | null = null;
  private expiresAt = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpClient: HttpClient,
  ) {}

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.expiresAt) return this.token;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.configService.get<string>('RMU_IAM_CLIENT_ID')!);
    params.append('client_secret', this.configService.get<string>('RMU_IAM_CLIENT_SECRET')!);

    const data = await this.httpClient.post<TokenResponse>(this.configService.get<string>('RMU_IAM_TOKEN_URI')!, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    this.token = data.access_token;
    this.expiresAt = now + data.expires_in * 1000 - 10_000;
    return this.token;
  }
}
