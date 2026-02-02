import { eq, and, gte, lte, desc, sql, or, ne, count, sum, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, rooms, InsertRoom, clients, InsertClient, bookings, InsertBooking, notifications, InsertNotification } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== ROOMS ====================

export async function createRoom(room: InsertRoom) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(rooms).values(room);
  return result;
}

export async function updateRoom(id: number, room: Partial<InsertRoom>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(rooms).set(room).where(eq(rooms.id, id));
}

export async function deleteRoom(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(rooms).where(eq(rooms.id, id));
}

export async function getRoomById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
  return result[0];
}

export async function getAllRooms() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(rooms).orderBy(rooms.name);
}

export async function getAvailableRooms() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(rooms).where(eq(rooms.isAvailable, true)).orderBy(rooms.name);
}

// ==================== CLIENTS ====================

export async function createClient(client: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(clients).values(client);
  return result;
}

export async function updateClient(id: number, client: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(clients).set(client).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(clients).where(eq(clients.id, id));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function searchClients(query: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(clients).where(
    or(
      like(clients.name, `%${query}%`),
      like(clients.email, `%${query}%`),
      like(clients.company, `%${query}%`)
    )
  ).orderBy(clients.name);
}

// ==================== BOOKINGS ====================

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function updateBooking(id: number, booking: Partial<InsertBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings).set(booking).where(eq(bookings.id, id));
}

export async function cancelBooking(id: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings).set({
    status: "cancelled",
    cancelledAt: new Date(),
    cancelReason: reason,
  }).where(eq(bookings.id, id));
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0];
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bookings).orderBy(desc(bookings.startTime));
}

export async function getBookingsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bookings).where(
    and(
      gte(bookings.startTime, startDate),
      lte(bookings.startTime, endDate)
    )
  ).orderBy(bookings.startTime);
}

export async function getBookingsByRoom(roomId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bookings).where(eq(bookings.roomId, roomId)).orderBy(desc(bookings.startTime));
}

export async function getBookingsByClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(bookings).where(eq(bookings.clientId, clientId)).orderBy(desc(bookings.startTime));
}

export async function checkRoomAvailability(roomId: number, startTime: Date, endTime: Date, excludeBookingId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [
    eq(bookings.roomId, roomId),
    or(
      and(
        gte(bookings.startTime, startTime),
        lte(bookings.startTime, endTime)
      ),
      and(
        gte(bookings.endTime, startTime),
        lte(bookings.endTime, endTime)
      ),
      and(
        lte(bookings.startTime, startTime),
        gte(bookings.endTime, endTime)
      )
    ),
    sql`${bookings.status} != 'cancelled'`
  ];
  
  if (excludeBookingId) {
    conditions.push(sql`${bookings.id} != ${excludeBookingId}`);
  }
  
  const conflicts = await db.select().from(bookings).where(and(...conditions));
  return conflicts.length === 0;
}

// ==================== NOTIFICATIONS ====================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(notifications).where(
    and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    )
  ).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ==================== REPORTS ====================

export async function getRoomOccupancyStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener todas las reservas con información de salas
  const allBookings = await db.select({
    roomId: bookings.roomId,
    roomName: rooms.name,
    startTime: bookings.startTime,
    endTime: bookings.endTime,
    totalPrice: bookings.totalPrice,
  })
  .from(bookings)
  .leftJoin(rooms, eq(bookings.roomId, rooms.id))
  .where(
    and(
      gte(bookings.startTime, startDate),
      lte(bookings.startTime, endDate),
      sql`${bookings.status} != 'cancelled'`
    )
  );
  
  // Agrupar por sala en memoria
  const grouped = new Map<number, { roomName: string; bookings: number; hours: number; revenue: number }>();
  
  for (const booking of allBookings) {
    const existing = grouped.get(booking.roomId) || {
      roomName: booking.roomName || "Sala desconocida",
      bookings: 0,
      hours: 0,
      revenue: 0,
    };
    
    existing.bookings += 1;
    const hours = (booking.endTime.getTime() - booking.startTime.getTime()) / (1000 * 60 * 60);
    existing.hours += Math.round(hours);
    existing.revenue += parseFloat(booking.totalPrice || "0");
    
    grouped.set(booking.roomId, existing);
  }
  
  // Convertir a array de resultados
  return Array.from(grouped.entries()).map(([roomId, data]) => ({
    roomId,
    roomName: data.roomName,
    totalBookings: data.bookings,
    totalHours: data.hours,
    totalRevenue: data.revenue.toFixed(2),
  }));
}

export async function getBookingStatusStats(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({
    status: bookings.status,
    count: sql<number>`COUNT(${bookings.id})`,
  })
  .from(bookings)
  .where(
    and(
      gte(bookings.startTime, startDate),
      lte(bookings.startTime, endDate)
    )
  )
  .groupBy(bookings.status);
  
  return result;
}

export async function getRevenueByPeriod(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener todas las reservas en el rango y procesar en memoria
  const allBookings = await db.select()
    .from(bookings)
    .where(
      and(
        gte(bookings.startTime, startDate),
        lte(bookings.startTime, endDate),
        sql`${bookings.status} != 'cancelled'`
      )
    );
  
  // Agrupar por fecha en memoria
  const grouped = new Map<string, { revenue: number; count: number }>();
  
  for (const booking of allBookings) {
    const dateKey = booking.startTime.toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || { revenue: 0, count: 0 };
    existing.revenue += parseFloat(booking.totalPrice || "0");
    existing.count += 1;
    grouped.set(dateKey, existing);
  }
  
  // Convertir a array de resultados
  return Array.from(grouped.entries()).map(([date, data]) => ({
    date,
    revenue: data.revenue.toFixed(2),
    bookings: data.count,
  })).sort((a, b) => a.date.localeCompare(b.date));
}
