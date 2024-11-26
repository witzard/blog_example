"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.SECRET;
if (!secretKey) {
  throw new Error("SECRET environment variable is not defined");
}

const key = new TextEncoder().encode(secretKey);
const TIMEOUT = 300; // 300 seconds (5 minutes)

/**
 * Encrypt a payload into a JWT.
 */
export async function encrypt(payload: Record<string, any>): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TIMEOUT}s`)
    .sign(key);
}

/**
 * Decrypt and verify a JWT.
 */
export async function decrypt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
      clockTolerance: 5, // Allow for slight clock skew
    });
    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT Verification Failed: ${error.message}`);
    } else {
      throw new Error("JWT Verification Failed");
    }
  }
}

/**
 * Log in a user by creating a session.
 */
export async function loginUser(userInput: { id: string; email: string; name: string }, remember: boolean) {
  const { id, email, name } = userInput;

  // Adjust session timeout if "remember me" is enabled
  const timeout = remember ? 24 * 60 * 60 : TIMEOUT; // 24 hours or default
  const session = await encrypt({ id, email, name });
  const expires = new Date(Date.now() + timeout * 1000);

  // Set session cookie
  cookies().set("session", session, { expires, httpOnly: true });
  return { message: "Login Successful" };
}

/**
 * Log out a user by deleting the session cookie.
 */
export async function logoutUser() {
  cookies().delete("session");
  return { message: "Logout Successful" };
}

/**
 * Retrieve and decrypt the current session.
 */
export async function getSession(): Promise<any | null> {
  const session = cookies().get("session")?.value;
  if (!session) return null;

  try {
    return await decrypt(session);
  } catch (error) {
    // If the session is invalid or expired, return null
    return null;
  }
}

/**
 * Update the session cookie to extend its expiration.
 */
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  try {
    const parsed = await decrypt(session);

    // Encrypt a refreshed session
    const updatedSession = await encrypt({
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
    });

    const res = NextResponse.next();
    res.cookies.set("session", updatedSession, {
      httpOnly: true,
      expires: new Date(Date.now() + TIMEOUT * 1000), // Extend expiration
    });
    return res;
  } catch (error) {
    // If decryption fails, clear the invalid session
    cookies().delete("session");
    throw new Error("Failed to update session");
  }
}
