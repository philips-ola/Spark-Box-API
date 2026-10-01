import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET || 'development-secret';

// convert secret into Uint8Array
export const JWT_SECRET = new TextEncoder().encode(secret);