import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export interface JWTPayload {
    userId: string;
    email: string;
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

// Compare password with hash
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Create a JWT token
export function createToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

// Verify and decode a JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Extract user from request (reads Authorization header or cookie)
export function getUserFromRequest(req: NextRequest): JWTPayload | null {
    // Try Authorization header first
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        return verifyToken(authHeader.slice(7));
    }

    // Try cookie
    const token = req.cookies.get("token")?.value;
    if (token) {
        return verifyToken(token);
    }

    return null;
}
