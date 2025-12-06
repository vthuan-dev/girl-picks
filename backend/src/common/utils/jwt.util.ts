import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function generateTokens(
  jwtService: JwtService,
  payload: TokenPayload,
  jwtSecret: string,
  jwtExpiresIn: string,
  refreshSecret: string,
  refreshExpiresIn: string,
): Promise<Tokens> {
  const [accessToken, refreshToken] = await Promise.all([
    jwtService.signAsync(payload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn,
    }),
    jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
