import jwt, { SignOptions } from "jsonwebtoken";
import { IJWTPayload } from "../types";

// Generate JWT access token
export const generateAccessToken = (
  payload: Omit<IJWTPayload, "iat" | "exp">
): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const options = {
    expiresIn: process.env.JWT_EXPIRE || "15m",
    issuer: "ltocms-api",
    audience: "ltocms-client",
  } as SignOptions;
  return jwt.sign(payload, secret, options);
};

// Generate JWT refresh token
export const generateRefreshToken = (
  payload: Omit<IJWTPayload, "iat" | "exp">
): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not defined");
  }
  const options = {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    issuer: "ltocms-api",
    audience: "ltocms-client",
  } as SignOptions;
  return jwt.sign(payload, secret, options);
};

// Verify JWT token
export const verifyToken = (token: string, secret: string): IJWTPayload => {
  return jwt.verify(token, secret) as IJWTPayload;
};

// Generate token pair
export const generateTokenPair = (
  payload: Omit<IJWTPayload, "iat" | "exp">
) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || "15m",
  };
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
