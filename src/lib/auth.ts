import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getDbItem, putDbItem, queryDbByPk, deleteDbItem } from "./db";

export type UserRole = "admin" | "editor" | "moderator";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRecord extends UserProfile {
  passwordHash: string;
}

const COOKIE_NAME = "bx_admin_token";

/**
 * Returns JWT secret derived strictly from AUTH_SECRET environment variable.
 * Refuses operation and logs an error if AUTH_SECRET is not configured.
 */
function getJwtSecret(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ||
    process.env.BEETRIX_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "beetrix360-dev-local-jwt-secret-key-32chars" : "");
  if (!secret || secret.trim() === "") {
    console.error(
      "[AUTH ERROR] ADMIN_JWT_SECRET (or AUTH_SECRET) environment variable is missing. Authentication refused."
    );
    throw new Error("ADMIN_JWT_SECRET environment variable is missing.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Ensures at least one master admin exists on initial setup.
 * Requires INITIAL_ADMIN_PASSWORD environment variable.
 * If missing, does not create any user and logs clear instructions.
 */
export async function seedInitialAdmin(): Promise<void> {
  const existing = await queryDbByPk<UserRecord>("USER");
  if (existing.length === 0) {
    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD;
    if (!initialPassword || initialPassword.trim() === "") {
      console.warn(
        "[AUTH NOTICE] No administrator accounts exist in the store, and INITIAL_ADMIN_PASSWORD is not set. To seed the initial admin account, set INITIAL_ADMIN_PASSWORD in .env.local or your environment variables."
      );
      return;
    }

    const initialEmail = (process.env.INITIAL_ADMIN_EMAIL || "admin@beetrix360.com").toLowerCase().trim();
    const initialName = process.env.INITIAL_ADMIN_NAME?.trim() || "Master Administrator";

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(initialPassword.trim(), salt);
    const initialAdmin: UserRecord = {
      id: "usr_initial_admin",
      email: initialEmail,
      name: initialName,
      role: "admin",
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };
    await putDbItem("USER", initialAdmin.id, initialAdmin);
  }
}

/**
 * Sign session token.
 */
export async function createSessionToken(user: UserProfile): Promise<string> {
  const secret = getJwtSecret();
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

let cliSessionTokenOverride: string | null = null;

/**
 * CLI test session helper.
 * Strictly disabled in production environment (NODE_ENV === "production").
 */
export function setCliSessionToken(token: string | null) {
  if (process.env.NODE_ENV === "production") {
    console.warn("[AUTH WARN] setCliSessionToken is disabled in production environment.");
    return;
  }
  cliSessionTokenOverride = token;
}

/**
 * Verifies current session from request cookies.
 */
export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    let token: string | null = null;

    // CLI override only available outside production environment
    if (process.env.NODE_ENV !== "production") {
      token = cliSessionTokenOverride;
    }

    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(COOKIE_NAME)?.value || null;
      } catch {
        // Fallback when called outside active request context
      }
    }
    if (!token) return null;

    const secret = getJwtSecret();

    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      createdAt: "",
    };
  } catch (err: any) {
    if (err?.message?.includes("AUTH_SECRET")) {
      console.error("[AUTH ERROR] Cannot verify session: AUTH_SECRET is missing.");
    }
    return null;
  }
}

/**
 * Set session cookie.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear session cookie (logout).
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * User CRUD Operations with RBAC protection
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  await seedInitialAdmin();
  const records = await queryDbByPk<UserRecord>("USER");
  return records.map(({ passwordHash: _, ...rest }) => rest);
}

export async function createUser(data: {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}): Promise<UserProfile> {
  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const salt = await bcrypt.genSalt(10);
  if (!data.password || data.password.trim() === "") {
    throw new Error("Password is required to create a user.");
  }
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newRecord: UserRecord = {
    id,
    email: data.email.toLowerCase().trim(),
    name: data.name.trim(),
    role: data.role,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  await putDbItem("USER", id, newRecord);
  const { passwordHash: _, ...profile } = newRecord;
  return profile;
}

export async function updateUserRole(id: string, newRole: UserRole): Promise<void> {
  const existing = await getDbItem<UserRecord>("USER", id);
  if (!existing) throw new Error("User not found");
  existing.role = newRole;
  existing.updatedAt = new Date().toISOString();
  await putDbItem("USER", id, existing);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteDbItem("USER", id);
}

export async function authenticateUser(email: string, password: string): Promise<UserProfile | null> {
  await seedInitialAdmin();
  const all = await queryDbByPk<UserRecord>("USER");
  const user = all.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  const { passwordHash: _, ...profile } = user;
  return profile;
}

/**
 * Role permissions helper
 */
export function canUpdate(user: UserProfile | null): boolean {
  if (!user) return false;
  return ["admin", "editor", "moderator"].includes(user.role);
}

export function canDelete(user: UserProfile | null): boolean {
  if (!user) return false;
  return ["admin", "moderator"].includes(user.role);
}

export function isAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.role === "admin";
}
