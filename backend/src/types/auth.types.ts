export interface JwtPayload {
  _id: string;
  email?: string;
}

export interface RegisterBody {
  Name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  RefreshToken?: string;
}

export interface SanitizedUser {
  _id: string;
  Name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
