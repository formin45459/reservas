import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

function createTestContext(): { ctx: TrpcContext; cookies: Map<string, string> } {
  const cookies = new Map<string, string>();

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string) => {
        cookies.set(name, value);
      },
      clearCookie: (name: string) => {
        cookies.delete(name);
      },
    } as TrpcContext["res"],
  };

  return { ctx, cookies };
}

describe("auth.register", () => {
  it("should register a new user successfully", async () => {
    const { ctx, cookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const testEmail = `test-${Date.now()}@example.com`;
    const result = await caller.auth.register({
      email: testEmail,
      password: "password123",
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.name).toBe("Test User");
    expect(cookies.has(COOKIE_NAME)).toBe(true);
  });

  it("should fail when registering with duplicate email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const testEmail = `duplicate-${Date.now()}@example.com`;
    
    // Primer registro
    await caller.auth.register({
      email: testEmail,
      password: "password123",
      name: "First User",
    });

    // Segundo registro con el mismo email debería fallar
    await expect(
      caller.auth.register({
        email: testEmail,
        password: "password456",
        name: "Second User",
      })
    ).rejects.toThrow("El email ya está registrado");
  });
});

describe("auth.login", () => {
  it("should login with correct credentials", async () => {
    const { ctx: registerCtx } = createTestContext();
    const registerCaller = appRouter.createCaller(registerCtx);

    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = "securepassword123";

    // Primero registrar un usuario
    await registerCaller.auth.register({
      email: testEmail,
      password: testPassword,
      name: "Login Test User",
    });

    // Ahora intentar hacer login
    const { ctx: loginCtx, cookies } = createTestContext();
    const loginCaller = appRouter.createCaller(loginCtx);

    const result = await loginCaller.auth.login({
      email: testEmail,
      password: testPassword,
    });

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(cookies.has(COOKIE_NAME)).toBe(true);
  });

  it("should fail with incorrect password", async () => {
    const { ctx: registerCtx } = createTestContext();
    const registerCaller = appRouter.createCaller(registerCtx);

    const testEmail = `wrong-pass-${Date.now()}@example.com`;

    // Registrar usuario
    await registerCaller.auth.register({
      email: testEmail,
      password: "correctpassword",
      name: "Test User",
    });

    // Intentar login con contraseña incorrecta
    const { ctx: loginCtx } = createTestContext();
    const loginCaller = appRouter.createCaller(loginCtx);

    await expect(
      loginCaller.auth.login({
        email: testEmail,
        password: "wrongpassword",
      })
    ).rejects.toThrow("Email o contraseña incorrectos");
  });

  it("should fail with non-existent email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "anypassword",
      })
    ).rejects.toThrow("Email o contraseña incorrectos");
  });
});
