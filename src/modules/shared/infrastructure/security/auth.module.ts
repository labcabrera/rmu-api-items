import { Module } from '@nestjs/common';
import { HttpClient } from '../http/http-client';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';

@Module({
  providers: [JwtStrategy, TokenService, HttpClient],
  exports: [TokenService, HttpClient],
})
export class AuthModule {}
