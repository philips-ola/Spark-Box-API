import { SignJWT } from "jose";
import { JWT_SECRET } from "./getJwtSecret.js";


/**
 * GEnerate a JWT
 * @param {object} payload - Data embed in the token
 * @param {string} expiresIn - Expiration time (e,g '15m' '7d' '30d')
 */
export const generateToken = async(payload, expiresIn = '15m') => {
    return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}