import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("rooms API", () => {
  it("should list rooms for authenticated users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const rooms = await caller.rooms.list();
    expect(Array.isArray(rooms)).toBe(true);
  });

  it("should allow admins to create rooms", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const newRoom = {
      name: "Sala de Prueba",
      type: "meeting" as const,
      capacity: 10,
      description: "Sala para reuniones",
      isAvailable: true,
      pricePerHour: "50.00",
    };

    const result = await caller.rooms.create(newRoom);
    expect(result).toBeDefined();
  });

  it("should prevent regular users from creating rooms", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const newRoom = {
      name: "Sala No Autorizada",
      type: "meeting" as const,
      capacity: 10,
    };

    await expect(caller.rooms.create(newRoom)).rejects.toThrow();
  });

  it("should list available rooms only", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const availableRooms = await caller.rooms.available();
    expect(Array.isArray(availableRooms)).toBe(true);
    
    // Todas las salas deben estar disponibles
    availableRooms.forEach(room => {
      expect(room.isAvailable).toBe(true);
    });
  });
});
