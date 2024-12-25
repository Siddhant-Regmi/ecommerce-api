export interface JwtPayload extends Request {
    payload: {
      user_id: number;
      role: string;
    };
  }