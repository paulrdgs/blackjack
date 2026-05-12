import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const ALG = "HS256";
const EXPIRATION = "30d";

export async function signToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRATION)
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
