import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Middleware para verificar rol de administrador
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo administradores pueden realizar esta acción' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { registerUser } = await import("./auth");
        await registerUser(input.email, input.password, input.name);
        
        // Hacer login automáticamente después del registro
        const { loginUser } = await import("./auth");
        const user = await loginUser(input.email, input.password);
        
        // Crear sesión
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(`local-${user.id}`, {
          name: user.name || "",
          expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 año
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        
        return { success: true, user };
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { loginUser } = await import("./auth");
        const user = await loginUser(input.email, input.password);
        
        // Crear sesión
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(`local-${user.id}`, {
          name: user.name || "",
          expiresInMs: 365 * 24 * 60 * 60 * 1000, // 1 año
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
        
        return { success: true, user };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== ROOMS ====================
  rooms: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllRooms();
    }),
    
    available: protectedProcedure.query(async () => {
      return await db.getAvailableRooms();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getRoomById(input.id);
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["meeting", "conference", "training", "office", "event"]),
        capacity: z.number().min(1),
        description: z.string().optional(),
        isAvailable: z.boolean().default(true),
        pricePerHour: z.string().optional(),
        amenities: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createRoom(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        type: z.enum(["meeting", "conference", "training", "office", "event"]).optional(),
        capacity: z.number().min(1).optional(),
        description: z.string().optional(),
        isAvailable: z.boolean().optional(),
        pricePerHour: z.string().optional(),
        amenities: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateRoom(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteRoom(input.id);
        return { success: true };
      }),
  }),

  // ==================== CLIENTS ====================
  clients: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllClients();
    }),
    
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchClients(input.query);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getClientById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createClient({
          ...input,
          createdBy: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateClient(id, data);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteClient(input.id);
        return { success: true };
      }),
    
    bookings: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBookingsByClient(input.clientId);
      }),
  }),

  // ==================== BOOKINGS ====================
  bookings: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllBookings();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBookingById(input.id);
      }),
    
    byDateRange: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getBookingsByDateRange(input.startDate, input.endDate);
      }),
    
    byRoom: protectedProcedure
      .input(z.object({ roomId: z.number() }))
      .query(async ({ input }) => {
        return await db.getBookingsByRoom(input.roomId);
      }),
    
    checkAvailability: protectedProcedure
      .input(z.object({
        roomId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
        excludeBookingId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.checkRoomAvailability(
          input.roomId,
          input.startTime,
          input.endTime,
          input.excludeBookingId
        );
      }),
    
    create: protectedProcedure
      .input(z.object({
        roomId: z.number(),
        clientId: z.number(),
        startTime: z.date(),
        endTime: z.date(),
        purpose: z.string().optional(),
        attendees: z.number().optional(),
        totalPrice: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar disponibilidad
        const isAvailable = await db.checkRoomAvailability(
          input.roomId,
          input.startTime,
          input.endTime
        );
        
        if (!isAvailable) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'La sala no está disponible en el horario seleccionado',
          });
        }
        
        const result = await db.createBooking({
          ...input,
          status: "pending",
          createdBy: ctx.user.id,
        });
        
        // Crear notificación para el usuario
        await db.createNotification({
          userId: ctx.user.id,
          type: "booking_created",
          title: "Reserva creada",
          message: `Se ha creado una nueva reserva para la sala`,
        });
        
        return result;
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        roomId: z.number().optional(),
        clientId: z.number().optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
        purpose: z.string().optional(),
        attendees: z.number().optional(),
        totalPrice: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        
        // Si se cambia horario o sala, verificar disponibilidad
        if (data.roomId || data.startTime || data.endTime) {
          const booking = await db.getBookingById(id);
          const roomId = data.roomId ?? booking.roomId;
          const startTime = data.startTime ?? booking.startTime;
          const endTime = data.endTime ?? booking.endTime;
          
          const isAvailable = await db.checkRoomAvailability(
            roomId,
            startTime,
            endTime,
            id
          );
          
          if (!isAvailable) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'La sala no está disponible en el horario seleccionado',
            });
          }
        }
        
        await db.updateBooking(id, data);
        
        // Crear notificación
        await db.createNotification({
          userId: ctx.user.id,
          type: "booking_updated",
          title: "Reserva actualizada",
          message: `Se ha actualizado la reserva #${id}`,
          relatedBookingId: id,
        });
        
        return { success: true };
      }),
    
    cancel: protectedProcedure
      .input(z.object({
        id: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.cancelBooking(input.id, input.reason);
        
        // Crear notificación
        await db.createNotification({
          userId: ctx.user.id,
          type: "booking_cancelled",
          title: "Reserva cancelada",
          message: `Se ha cancelado la reserva #${input.id}`,
          relatedBookingId: input.id,
        });
        
        return { success: true };
      }),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),
    
    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ==================== REPORTS ====================
  reports: router({
    roomOccupancy: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getRoomOccupancyStats(input.startDate, input.endDate);
      }),
    
    bookingStatus: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getBookingStatusStats(input.startDate, input.endDate);
      }),
    
    revenue: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getRevenueByPeriod(input.startDate, input.endDate);
      }),
  }),
});

export type AppRouter = typeof appRouter;
