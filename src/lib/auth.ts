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

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "beetrix360-super-secret-jwt-key-2026-production"
);
const COOKIE_NAME = "bx_admin_token";

/**
 * Ensures at least one master admin exists on initial setup.
 */
export async function seedInitialAdmin(): Promise<void> {
  const existing = await queryDbByPk<UserRecord>("USER");
  if (existing.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("admin123456", salt);
    const initialAdmin: UserRecord = {
      id: "usr_initial_admin",
      email: "admin@beetrix360.com",
      name: "Master Administrator",
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
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifies current session from request cookies.
 */
export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      createdAt: "",
    };
  } catch {
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
  const passwordHash = await bcrypt.hash(data.password || "BeetrixPass2026!", salt);

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
