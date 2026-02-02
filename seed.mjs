import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { users, rooms, clients, bookings } from "./drizzle/schema.ts";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

// Datos de ejemplo
const seedData = {
  users: [
    {
      name: "Admin Principal",
      email: "admin@reservas.com",
      password: "Admin@2026!Secure",
      role: "admin",
    },
    {
      name: "María García",
      email: "maria@reservas.com",
      password: "Maria#2026$Pass",
      role: "user",
    },
    {
      name: "Carlos Rodríguez",
      email: "carlos@reservas.com",
      password: "Carlos&2026*Key",
      role: "user",
    },
  ],
  rooms: [
    {
      name: "Sala Ejecutiva A",
      capacity: 8,
      type: "meeting",
      pricePerHour: "50.00",
      description: "Sala equipada con proyector, pizarra y videoconferencia",
      isAvailable: true,
    },
    {
      name: "Sala Ejecutiva B",
      capacity: 12,
      type: "meeting",
      pricePerHour: "75.00",
      description: "Sala amplia con sistema de sonido y pantalla LED",
      isAvailable: true,
    },
    {
      name: "Auditorio Principal",
      capacity: 50,
      type: "event",
      pricePerHour: "200.00",
      description: "Auditorio con capacidad para eventos y presentaciones",
      isAvailable: true,
    },
    {
      name: "Sala de Capacitación",
      capacity: 20,
      type: "training",
      pricePerHour: "100.00",
      description: "Sala ideal para cursos y talleres con mesas modulares",
      isAvailable: true,
    },
    {
      name: "Sala Creativa",
      capacity: 6,
      type: "office",
      pricePerHour: "40.00",
      description: "Espacio informal para sesiones de brainstorming",
      isAvailable: true,
    },
    {
      name: "Sala VIP",
      capacity: 4,
      type: "conference",
      pricePerHour: "120.00",
      description: "Sala exclusiva para reuniones confidenciales",
      isAvailable: true,
    },
  ],
  clients: [
    {
      name: "TechCorp Solutions",
      email: "contacto@techcorp.com",
      phone: "+34 912 345 678",
      company: "TechCorp Solutions S.L.",
      notes: "Cliente corporativo frecuente",
    },
    {
      name: "Ana Martínez",
      email: "ana.martinez@email.com",
      phone: "+34 623 456 789",
      company: "Freelance",
      notes: "Diseñadora gráfica independiente",
    },
    {
      name: "Innovatech Consulting",
      email: "info@innovatech.es",
      phone: "+34 915 678 901",
      company: "Innovatech Consulting",
      notes: "Consultoría tecnológica",
    },
    {
      name: "Pedro Sánchez",
      email: "pedro.sanchez@empresa.com",
      phone: "+34 634 567 890",
      company: "Marketing Digital Pro",
      notes: "Especialista en marketing digital",
    },
    {
      name: "Global Events S.A.",
      email: "eventos@globalevents.com",
      phone: "+34 917 890 123",
      company: "Global Events S.A.",
      notes: "Organizadora de eventos corporativos",
    },
    {
      name: "Laura Fernández",
      email: "laura.fernandez@coaching.com",
      phone: "+34 645 678 901",
      company: "Life Coach Pro",
      notes: "Coach profesional certificada",
    },
    {
      name: "StartUp Hub",
      email: "contact@startuphub.es",
      phone: "+34 918 901 234",
      company: "StartUp Hub Accelerator",
      notes: "Aceleradora de startups",
    },
    {
      name: "Roberto Díaz",
      email: "roberto.diaz@abogados.com",
      phone: "+34 656 789 012",
      company: "Díaz & Asociados",
      notes: "Bufete de abogados",
    },
    {
      name: "Elena Torres",
      email: "elena.torres@arquitectura.com",
      phone: "+34 667 890 123",
      company: "Torres Arquitectos",
      notes: "Estudio de arquitectura",
    },
    {
      name: "Finanzas Corp",
      email: "info@finanzascorp.es",
      phone: "+34 919 012 345",
      company: "Finanzas Corp S.A.",
      notes: "Asesoría financiera corporativa",
    },
    {
      name: "Miguel Álvarez",
      email: "miguel.alvarez@tech.com",
      phone: "+34 678 901 234",
      company: "DevTech Solutions",
      notes: "Desarrollador de software",
    },
    {
      name: "Salud Integral",
      email: "contacto@saludintegral.es",
      phone: "+34 920 123 456",
      company: "Salud Integral Clínica",
      notes: "Centro médico privado",
    },
    {
      name: "Carmen Ruiz",
      email: "carmen.ruiz@formacion.com",
      phone: "+34 689 012 345",
      company: "Formación Profesional Plus",
      notes: "Formadora corporativa",
    },
    {
      name: "Inmobiliaria Prime",
      email: "ventas@inmoprime.es",
      phone: "+34 921 234 567",
      company: "Inmobiliaria Prime",
      notes: "Agencia inmobiliaria de lujo",
    },
    {
      name: "Javier Moreno",
      email: "javier.moreno@legal.com",
      phone: "+34 690 123 456",
      company: "Moreno Abogados",
      notes: "Abogado mercantilista",
    },
    {
      name: "EcoTech Innovations",
      email: "info@ecotech.es",
      phone: "+34 922 345 678",
      company: "EcoTech Innovations S.L.",
      notes: "Tecnología sostenible",
    },
    {
      name: "Patricia Gómez",
      email: "patricia.gomez@recursos.com",
      phone: "+34 601 234 567",
      company: "Recursos Humanos 360",
      notes: "Consultora de RRHH",
    },
    {
      name: "Media Group",
      email: "produccion@mediagroup.es",
      phone: "+34 923 456 789",
      company: "Media Group Productions",
      notes: "Productora audiovisual",
    },
    {
      name: "Francisco Jiménez",
      email: "francisco.jimenez@contable.com",
      phone: "+34 612 345 678",
      company: "Jiménez Contabilidad",
      notes: "Asesor contable",
    },
    {
      name: "Design Studio Pro",
      email: "hola@designstudio.es",
      phone: "+34 924 567 890",
      company: "Design Studio Pro",
      notes: "Estudio de diseño gráfico",
    },
    {
      name: "Beatriz Navarro",
      email: "beatriz.navarro@psicologia.com",
      phone: "+34 623 456 789",
      company: "Psicología Clínica",
      notes: "Psicóloga clínica",
    },
    {
      name: "Logistica Express",
      email: "operaciones@logisticaexpress.es",
      phone: "+34 925 678 901",
      company: "Logística Express S.A.",
      notes: "Empresa de logística",
    },
    {
      name: "Antonio Serrano",
      email: "antonio.serrano@ingenieria.com",
      phone: "+34 634 567 890",
      company: "Serrano Ingeniería",
      notes: "Ingeniero industrial",
    },
    {
      name: "Fashion Boutique",
      email: "info@fashionboutique.es",
      phone: "+34 926 789 012",
      company: "Fashion Boutique",
      notes: "Tienda de moda",
    },
    {
      name: "Isabel Morales",
      email: "isabel.morales@nutricion.com",
      phone: "+34 645 678 901",
      company: "Nutrición y Salud",
      notes: "Nutricionista certificada",
    },
    {
      name: "Construcciones García",
      email: "proyectos@construccionesgarcia.es",
      phone: "+34 927 890 123",
      company: "Construcciones García S.L.",
      notes: "Constructora",
    },
    {
      name: "David López",
      email: "david.lopez@fotografia.com",
      phone: "+34 656 789 012",
      company: "López Fotografía",
      notes: "Fotógrafo profesional",
    },
    {
      name: "Seguros Total",
      email: "clientes@segurostotal.es",
      phone: "+34 928 901 234",
      company: "Seguros Total",
      notes: "Correduría de seguros",
    },
    {
      name: "Rosa Castillo",
      email: "rosa.castillo@traduccion.com",
      phone: "+34 667 890 123",
      company: "Traducciones Profesionales",
      notes: "Traductora jurada",
    },
    {
      name: "Gastronomía Selecta",
      email: "reservas@gastroselecta.es",
      phone: "+34 929 012 345",
      company: "Gastronomía Selecta",
      notes: "Catering de eventos",
    },
    {
      name: "Luis Herrera",
      email: "luis.herrera@auditoria.com",
      phone: "+34 678 901 234",
      company: "Herrera Auditoría",
      notes: "Auditor financiero",
    },
    {
      name: "Viajes Mundo",
      email: "info@viajesmundo.es",
      phone: "+34 930 123 456",
      company: "Viajes Mundo",
      notes: "Agencia de viajes",
    },
    {
      name: "Silvia Ortega",
      email: "silvia.ortega@veterinaria.com",
      phone: "+34 689 012 345",
      company: "Clínica Veterinaria Ortega",
      notes: "Veterinaria",
    },
    {
      name: "Tecnología Avanzada",
      email: "soporte@tecavanzada.es",
      phone: "+34 931 234 567",
      company: "Tecnología Avanzada S.A.",
      notes: "Soporte técnico IT",
    },
  ],
};

// Función para generar fechas aleatorias en los próximos 30 días
function getRandomDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(Math.floor(Math.random() * 10) + 8); // Entre 8am y 6pm
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

function getEndTime(startTime, hours) {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + hours);
  return endTime;
}

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...\n");

  try {
    // Limpiar tablas existentes
    console.log("🧽 Limpiando base de datos...");
    await sql`DELETE FROM bookings`;
    await sql`DELETE FROM notifications`;
    await sql`DELETE FROM clients`;
    await sql`DELETE FROM rooms`;
    await sql`DELETE FROM users`;
    console.log("✓ Base de datos limpiada\n");
    // 1. Crear usuarios
    console.log("👤 Creando usuarios...");
    const userIds = [];
    for (const userData of seedData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const result = await db.insert(users).values({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        loginMethod: 'local',
        role: userData.role,
        lastSignedIn: new Date(),
      }).returning({ id: users.id });
      userIds.push(result[0].id);
      console.log(`  ✓ Usuario creado: ${userData.email} (password: ${userData.password})`);
    }

    // 2. Crear salas
    console.log("\n🏢 Creando salas...");
    const roomIds = [];
    for (const room of seedData.rooms) {
      const result = await db.insert(rooms).values({
        name: room.name,
        capacity: room.capacity,
        type: room.type,
        pricePerHour: room.pricePerHour,
        description: room.description,
        isAvailable: room.isAvailable,
        createdBy: userIds[0],
      }).returning({ id: rooms.id });
      roomIds.push(result[0].id);
      console.log(`  ✓ Sala creada: ${room.name}`);
    }

    // 3. Crear clientes
    console.log("\n👥 Creando clientes...");
    const clientIds = [];
    for (const client of seedData.clients) {
      const result = await db.insert(clients).values({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        notes: client.notes,
        createdBy: userIds[0],
      }).returning({ id: clients.id });
      clientIds.push(result[0].id);
      console.log(`  ✓ Cliente creado: ${client.name}`);
    }

    // 4. Crear reservas
    console.log("\n📅 Creando reservas...");
    const statuses = ["pending", "confirmed", "completed", "cancelled"];
    const bookingsToCreate = 200; // Aumentado de 25 a 200

    for (let i = 0; i < bookingsToCreate; i++) {
      const roomId = roomIds[Math.floor(Math.random() * roomIds.length)];
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      
      // Fechas aleatorias en los últimos 90 días y próximos 30 días (total 120 días)
      const daysFromNow = Math.floor(Math.random() * 120) - 90; // De -90 a +30 días
      const startTime = getRandomDate(daysFromNow);
      const duration = [2, 3, 4, 6, 8][Math.floor(Math.random() * 5)];
      const endTime = getEndTime(startTime, duration);
      
      // Determinar estado basado en la fecha
      let status;
      if (daysFromNow < -7) {
        // Reservas pasadas (hace más de 1 semana): 85% completadas, 15% canceladas
        status = Math.random() > 0.15 ? "completed" : "cancelled";
      } else if (daysFromNow < 0) {
        // Reservas recientes pasadas: 90% completadas, 10% canceladas
        status = Math.random() > 0.1 ? "completed" : "cancelled";
      } else if (daysFromNow < 3) {
        // Reservas muy próximas: todas confirmadas
        status = "confirmed";
      } else if (daysFromNow < 15) {
        // Reservas próximas: 70% confirmadas, 30% pendientes
        status = Math.random() > 0.3 ? "confirmed" : "pending";
      } else {
        // Reservas futuras: 40% confirmadas, 60% pendientes
        status = Math.random() > 0.6 ? "confirmed" : "pending";
      }

      // Calcular precio total
      const room = seedData.rooms.find((_, idx) => roomIds[idx] === roomId);
      const totalPrice = (parseFloat(room.pricePerHour) * duration).toFixed(2);

      await db.insert(bookings).values({
        roomId,
        clientId,
        userId,
        startTime,
        endTime,
        status,
        totalPrice,
        notes: `Reserva de ${duration} horas`,
        createdBy: userId,
      });
      
      const statusEmoji = {
        pending: "⏳",
        confirmed: "✅",
        completed: "🎉",
        cancelled: "❌",
      };
      console.log(`  ${statusEmoji[status]} Reserva creada: ${startTime.toLocaleDateString()} - ${status}`);
    }

    console.log("\n✨ Seed completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log(`  • ${userIds.length} usuarios creados`);
    console.log(`  • ${roomIds.length} salas creadas`);
    console.log(`  • ${clientIds.length} clientes creados`);
    console.log(`  • ${bookingsToCreate} reservas creadas`);
    console.log("\n🔑 Credenciales de acceso:");
    console.log("  Admin: admin@reservas.com / Admin@2026!Secure");
    console.log("  Usuario: maria@reservas.com / Maria#2026$Pass");
    console.log("  Usuario: carlos@reservas.com / Carlos&2026*Key");

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error durante el seed:", error);
    await sql.end();
    process.exit(1);
  }
}

seed();
