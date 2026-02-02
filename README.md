# Sistema de Gestión de Reservas de Salas

Sistema completo de gestión de reservas de salas con autenticación, calendario interactivo, reportes y notificaciones.

## 🚀 Características

- ✅ **Autenticación**: Sistema de login y registro con JWT
- 📅 **Calendario interactivo**: Visualización de reservas por sala y fecha
- 🏢 **Gestión de Salas**: CRUD completo de salas con capacidad, tipo y disponibilidad
- 👥 **Gestión de Clientes**: Administración de clientes con historial de reservas
- 📝 **Gestión de Reservas**: Crear, editar y cancelar reservas con validación de disponibilidad
- 📊 **Reportes**: Estadísticas de ocupación y uso de salas
- 🔔 **Notificaciones**: Sistema de notificaciones en tiempo real
- 🎨 **UI Moderna**: Interfaz elegante y profesional con tema claro/oscuro

## 🛠️ Tecnologías

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS 4
- tRPC + React Query
- Wouter (routing)
- shadcn/ui components
- Recharts (gráficos)
- React Hook Form + Zod

### Backend
- Node.js + Express
- tRPC
- Drizzle ORM
- PostgreSQL
- JWT (Jose)
- Bcrypt

## 📋 Requisitos

- Node.js 18+
- PostgreSQL
- pnpm (recomendado)

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd sala_reservas
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` basándote en `.env.example`:
```bash
cp .env.example .env
```

Edita `.env` con tus valores:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sala_reservas
JWT_SECRET=tu-clave-secreta-super-segura
NODE_ENV=development
```

4. **Configurar la base de datos**
```bash
# Generar migraciones y ejecutarlas
pnpm db:push
```

5. **Poblar con datos de ejemplo (opcional)**
```bash
pnpm seed
```

6. **Iniciar el servidor de desarrollo**
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:5000`

## 📦 Scripts disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor en producción
- `pnpm test` - Ejecuta los tests
- `pnpm check` - Verifica tipos de TypeScript
- `pnpm format` - Formatea el código con Prettier
- `pnpm db:push` - Genera y ejecuta migraciones de base de datos
- `pnpm seed` - Puebla la base de datos con datos de ejemplo

## 🚢 Despliegue

### Vercel

1. **Preparar el proyecto**
   - Asegúrate de tener todos los archivos necesarios
   - Verifica que el archivo `vercel.json` esté configurado correctamente

2. **Variables de entorno en Vercel**
   
   Configura las siguientes variables en tu proyecto de Vercel:
   - `DATABASE_URL`: URL de tu base de datos PostgreSQL
   - `JWT_SECRET`: Clave secreta para JWT
   - `NODE_ENV`: production

3. **Desplegar**
```bash
# Usando Vercel CLI
vercel deploy --prod

# O conecta tu repositorio de GitHub en Vercel Dashboard
```

### Otras plataformas

Para desplegar en otras plataformas:
1. Construye el proyecto: `pnpm build`
2. El directorio `dist/` contendrá los archivos estáticos del frontend
3. El archivo `dist/index.js` es el servidor Node.js
4. Configura las variables de entorno necesarias
5. Ejecuta `pnpm start` para iniciar el servidor

## 📁 Estructura del proyecto

```
sala_reservas/
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilidades y configuración
├── server/          # Backend tRPC
│   ├── _core/       # Configuración del servidor
│   ├── auth.ts      # Autenticación
│   └── routers.ts   # Routers de tRPC
├── drizzle/         # Esquema de base de datos
└── shared/          # Código compartido entre frontend y backend
```

## 👤 Usuarios por defecto (después del seed)

- **Admin**: admin@example.com / admin123
- **Usuario**: user@example.com / user123

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt
- Autenticación basada en JWT
- Validación de datos con Zod
- Variables de entorno para secretos

## 📝 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📧 Contacto

Para soporte o consultas, abre un issue en el repositorio.
