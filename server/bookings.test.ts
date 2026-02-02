import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

describe("bookings API", () => {
  it("should list bookings for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const bookings = await caller.bookings.list();
    expect(Array.isArray(bookings)).toBe(true);
  });

  it("should filter bookings by date range", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-01-31");

    const bookings = await caller.bookings.byDateRange({ startDate, endDate });
    expect(Array.isArray(bookings)).toBe(true);
    
    // Verificar que todas las reservas están en el rango
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.startTime);
      expect(bookingDate >= startDate && bookingDate <= endDate).toBe(true);
    });
  });

  it("should check room availability", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(12, 0, 0, 0);

    const isAvailable = await caller.bookings.checkAvailability({
      roomId: 1,
      startTime: tomorrow,
      endTime: endTime,
    });

    expect(typeof isAvailable).toBe("boolean");
  });

  it("should require authentication for booking operations", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };
    
    const caller = appRouter.createCaller(ctx);

    await expect(caller.bookings.list()).rejects.toThrow();
  });
});
