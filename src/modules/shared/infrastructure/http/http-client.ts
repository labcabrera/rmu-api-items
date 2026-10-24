import { Injectable } from '@nestjs/common';

/** A response outside 2xx. `status` is the HTTP status the other service answered. */
export class HttpClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly url: string,
    public readonly body: string,
  ) {
    super(`Request to ${url} failed with status ${status}`);
    this.name = 'HttpClientError';
  }
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  body?: string | URLSearchParams;
  /** No timeout unless set, as with the axios defaults this client replaces (spec 020, decision 5). */
  timeoutMs?: number;
}

/** JSON over the fetch of Node 24, for the calls to other APIs and to Keycloak. */
@Injectable()
export class HttpClient {
  get<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', url, options);
  }

  post<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', url, options);
  }

  private async request<T>(method: string, url: string, options: HttpRequestOptions): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: { Accept: 'application/json', ...options.headers },
      body: options.body,
      signal: options.timeoutMs ? AbortSignal.timeout(options.timeoutMs) : undefined,
    });
    const text = await response.text();
    if (!response.ok) throw new HttpClientError(response.status, url, text);
    return (text ? JSON.parse(text) : undefined) as T;
  }
}
