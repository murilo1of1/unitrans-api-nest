import type { Request } from 'express';
import * as crypto from 'crypto';

const ABACATEPAY_PUBLIC_KEY = "t9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9";

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

export function verifyAbacateSignature(req: RequestWithRawBody): boolean {
  if (!req.rawBody) {
    return false;
  }

  const signatureFromHeader = req.headers['x-webhook-signature'] as string;
  if (!signatureFromHeader) return false;

  const rawBodyString = req.rawBody.toString('utf8');
  const bodyBuffer = Buffer.from(rawBodyString, "utf8");

  const expectedSig = crypto
    .createHmac("sha256", ABACATEPAY_PUBLIC_KEY)
    .update(bodyBuffer)
    .digest("base64");

  const A = Buffer.from(expectedSig);
  const B = Buffer.from(signatureFromHeader);

  return A.length === B.length && crypto.timingSafeEqual(A, B);
}