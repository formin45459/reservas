import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "./db";

export async function registerUser(email: string, password: string, name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar si el email ya existe
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("El email ya está registrado");
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    loginMethod: "local",
    role: "user",
    lastSignedIn: new Date(),
  });

  return result;
}

export async function loginUser(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuario por email
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (result.length === 0) {
    throw new Error("Email o contraseña incorrectos");
  }

  const user = result[0];

  // Verificar contraseña
  if (!user.password) {
    throw new Error("Usuario no tiene contraseña configurada");
  }

  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    throw new Error("Email o contraseña incorrectos");
  }

  // Actualizar última sesión
  await db.update(users).set({
    lastSignedIn: new Date(),
  }).where(eq(users.id, user.id));

  return user;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
