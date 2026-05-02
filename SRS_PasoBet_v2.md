# DOCUMENTO DE ESPECIFICACIÓN DE REQUERIMIENTOS DE SOFTWARE (SRS)
## PasoBet — Plataforma Móvil de Apuestas Hípicas Colombianas

---

| Campo | Detalle |
|---|---|
| **Versión** | 2.0 |
| **Fecha** | Abril 2026 |
| **Estado** | MVP — En desarrollo |
| **Clasificación** | Confidencial |

### Historial de versiones

| Versión | Fecha | Autor | Cambios |
|---|---|---|---|
| 1.0 | Mar 2026 | Equipo PasoBet | Borrador inicial |
| 2.0 | Abr 2026 | Equipo PasoBet | Corrección de stack tecnológico, ampliación de requerimientos, modelo de datos completo, API documentada |

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Requerimientos Funcionales](#4-requerimientos-funcionales)
5. [Requerimientos No Funcionales](#5-requerimientos-no-funcionales)
6. [Modelo de Datos](#6-modelo-de-datos)
7. [Diseño de API REST](#7-diseño-de-api-rest)
8. [Reglas de Negocio](#8-reglas-de-negocio)
9. [Flujos de Usuario](#9-flujos-de-usuario)
10. [Seguridad](#10-seguridad)
11. [Restricciones y Supuestos](#11-restricciones-y-supuestos)
12. [Criterios de Aceptación](#12-criterios-de-aceptación)
13. [Glosario](#13-glosario)
14. [Futuras Mejoras](#14-futuras-mejoras)

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requerimientos funcionales y no funcionales de **PasoBet**, una aplicación móvil de apuestas deportivas enfocada exclusivamente en competencias de caballo criollo colombiano. Está dirigido a desarrolladores, diseñadores, testers y stakeholders del proyecto.

### 1.2 Alcance del Sistema

PasoBet es una plataforma MVP (Producto Mínimo Viable) que permite a usuarios colombianos apostar en línea sobre competencias ecuestres de tres disciplinas nacionales:

- **Paso Fino Colombiano**
- **Trocha Pura**
- **Trote y Galope**

El sistema abarca registro de usuarios, gestión de billetera virtual, visualización de eventos, colocación de apuestas en tiempo real, y administración de resultados.

> **Nota importante:** Esta versión MVP no integra pagos reales. Los depósitos y retiros son simulados. La integración con pasarelas de pago (PSE, Nequi, Bancolombia) se planifica para versiones futuras.

### 1.3 Contexto del Negocio

El caballo criollo colombiano es patrimonio cultural de Colombia. Las competencias de Paso Fino, Trocha Pura y Trote y Galope convocan miles de espectadores en ferias y fiestas regionales. PasoBet busca digitalizar la experiencia de apuestas que hoy ocurre de manera informal, ofreciendo una plataforma segura, transparente y entretenida.

### 1.4 Stakeholders

| Rol | Descripción |
|---|---|
| Apostador (Usuario) | Persona mayor de 18 años que desea apostar en eventos |
| Administrador | Operador que gestiona eventos, caballos, cuotas y resultados |
| Equipo de desarrollo | Responsables del diseño, implementación y mantenimiento |

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del Producto

PasoBet es un sistema independiente con arquitectura cliente-servidor desacoplada:

```
┌─────────────────────┐         ┌──────────────────────────┐
│   App Móvil         │  HTTPS  │    API Backend           │
│   React Native      │◄───────►│    Node.js + Express     │
│   Expo / TypeScript │         │    TypeScript            │
└─────────────────────┘         └────────────┬─────────────┘
                                             │
                                ┌────────────▼─────────────┐
                                │   Base de Datos          │
                                │   PostgreSQL + Prisma    │
                                └──────────────────────────┘
                                             │ WebSocket
                                ┌────────────▼─────────────┐
                                │   Tiempo Real            │
                                │   Socket.io              │
                                └──────────────────────────┘
```

### 2.2 Tipos de Usuarios

#### Usuario Estándar (Apostador)
- Accede mediante la app móvil
- Puede ver eventos, caballos, cuotas
- Puede depositar, apostar y retirar (simulado)
- Consulta su historial de apuestas y transacciones

#### Administrador
- Accede mediante endpoints de API (sin interfaz de usuario en MVP)
- Crea y gestiona eventos
- Registra caballos y los asigna a eventos
- Define y actualiza cuotas
- Liquida eventos y distribuye ganancias

### 2.3 Características Principales

| Módulo | Descripción |
|---|---|
| Autenticación | Registro, login, JWT, rutas protegidas |
| Billetera | Saldo, depósitos, retiros, historial de transacciones |
| Eventos | Listado, filtros, detalle por evento |
| Caballos | Ficha técnica, estadísticas, asignación a eventos |
| Apuestas | Ganador, Cara a Cara, validaciones, pagos |
| Tiempo real | Cuotas en vivo, nuevos eventos vía WebSocket |
| Perfil | Datos personales, estadísticas, historial |

---

## 3. Arquitectura del Sistema

### 3.1 Stack Tecnológico

#### Frontend — App Móvil

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | 0.74 | Framework móvil multiplataforma |
| Expo | 51 | Herramientas de desarrollo y build |
| TypeScript | 5.3 | Tipado estático |
| React Navigation | 6.x | Navegación entre pantallas |
| Axios | 1.6 | Peticiones HTTP al API |
| Socket.io Client | 4.6 | Conexión WebSocket en tiempo real |
| Expo Secure Store | 13 | Almacenamiento seguro del token JWT |

#### Backend — API REST

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Entorno de ejecución |
| Express | 4.18 | Framework HTTP |
| TypeScript | 5.3 | Tipado estático |
| Prisma ORM | 5.7 | Acceso a base de datos |
| Socket.io | 4.6 | WebSockets para tiempo real |
| bcryptjs | 2.4 | Hash de contraseñas |
| jsonwebtoken | 9.0 | Generación y validación de JWT |

#### Base de Datos

| Tecnología | Versión | Uso |
|---|---|---|
| PostgreSQL | 14+ | Base de datos relacional principal |
| Prisma Migrate | 5.7 | Migraciones de esquema |

### 3.2 Estructura del Proyecto (Monorepo)

```
pasobet/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de base de datos
│   ├── src/
│   │   ├── controllers/           # Lógica de cada dominio
│   │   │   ├── auth.controller.ts
│   │   │   ├── bet.controller.ts
│   │   │   ├── wallet.controller.ts
│   │   │   ├── event.controller.ts
│   │   │   ├── admin.controller.ts
│   │   │   └── profile.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # Validación JWT
│   │   │   └── error.middleware.ts # Manejo centralizado de errores
│   │   ├── routes/                # Definición de rutas Express
│   │   ├── services/              # Lógica de negocio (futuro)
│   │   ├── lib/
│   │   │   ├── prisma.ts          # Singleton de Prisma Client
│   │   │   └── jwt.ts             # Utilidades de token
│   │   ├── socket/
│   │   │   └── socket.handler.ts  # Eventos WebSocket
│   │   ├── seed.ts                # Datos de prueba iniciales
│   │   └── index.ts               # Punto de entrada
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/
    ├── src/
    │   ├── screens/
    │   │   ├── auth/              # Login, Registro
    │   │   ├── home/              # Eventos, Detalle, Apostar
    │   │   ├── wallet/            # Billetera
    │   │   ├── bets/              # Mis apuestas
    │   │   └── profile/           # Perfil
    │   ├── components/
    │   │   └── ui/                # Button, Input, Card, Badge
    │   ├── navigation/            # Stack y Tab navigators
    │   ├── context/               # AuthContext, WalletContext
    │   ├── services/
    │   │   ├── api.ts             # Axios + interceptores
    │   │   └── socket.ts          # Conexión Socket.io
    │   └── theme/
    │       └── index.ts           # Colores, tipografía, espaciado
    ├── App.tsx
    ├── app.json
    └── package.json
```

### 3.3 Patrones de Diseño Aplicados

- **MVC en backend:** Separación clara entre rutas, controladores y acceso a datos.
- **Context API en frontend:** Estado global de autenticación y billetera.
- **Singleton de Prisma:** Una sola instancia del cliente de base de datos.
- **Interceptores de Axios:** Adjuntar token JWT automáticamente en cada petición.
- **Transacciones de base de datos:** Operaciones críticas (apuestas, pagos) envueltas en `prisma.$transaction()` para garantizar atomicidad.

---

## 4. Requerimientos Funcionales

### RF-01: Registro de Usuario

| Campo | Detalle |
|---|---|
| **ID** | RF-01 |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |
| **Descripción** | El sistema debe permitir a un nuevo usuario crear una cuenta. |

**Entradas requeridas:**
- `email` — formato válido, único en el sistema
- `password` — mínimo 8 caracteres
- `firstName` — nombre del usuario
- `lastName` — apellido del usuario
- `phone` — opcional, número colombiano

**Proceso:**
1. Validar que el email no esté registrado
2. Hashear la contraseña con bcrypt (salt rounds: 12)
3. Crear registro en tabla `users`
4. Crear billetera con saldo inicial $0 COP en tabla `wallets`
5. Generar token JWT con payload `{ userId, email, role }`
6. Retornar token y datos del usuario

**Resultado:** Token JWT + datos de usuario + billetera creada

---

### RF-02: Inicio de Sesión

| Campo | Detalle |
|---|---|
| **ID** | RF-02 |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |

**Entradas:** `email`, `password`

**Proceso:**
1. Buscar usuario por email
2. Verificar que el usuario esté activo
3. Comparar contraseña con hash almacenado (bcrypt.compare)
4. Generar nuevo token JWT con expiración de 7 días
5. Retornar token y datos del usuario

**Errores manejados:** Usuario no encontrado, contraseña incorrecta, usuario inactivo.

---

### RF-03: Autenticación mediante JWT

| Campo | Detalle |
|---|---|
| **ID** | RF-03 |
| **Módulo** | Autenticación |
| **Prioridad** | Alta |

Todas las rutas protegidas (excepto `/auth/register` y `/auth/login`) requieren el header:

```
Authorization: Bearer <token>
```

El middleware valida:
- Existencia del token
- Firma válida con el `JWT_SECRET`
- Token no expirado

---

### RF-04: Consultar Eventos

| Campo | Detalle |
|---|---|
| **ID** | RF-04 |
| **Módulo** | Eventos |
| **Prioridad** | Alta |

**Parámetros opcionales:** `status`, `type`, `page`, `limit`

El sistema devuelve una lista paginada de eventos con:
- Nombre, tipo, estado, fecha, sede, ciudad
- Lista de caballos participantes con sus cuotas
- Número total de apuestas por evento

**Filtros disponibles:**
- Por tipo: `PASO_FINO`, `TROCHA_PURA`, `TROTE_Y_GALOPE`
- Por estado: `UPCOMING`, `LIVE`, `FINISHED`, `CANCELLED`

---

### RF-05: Detalle de Evento

| Campo | Detalle |
|---|---|
| **ID** | RF-05 |
| **Módulo** | Eventos |
| **Prioridad** | Alta |

El sistema devuelve toda la información de un evento específico incluyendo:
- Datos del evento
- Lista completa de caballos con posición, cuotas, estadísticas, jinete, propietario
- Si el evento está EN VIVO, las cuotas se actualizan en tiempo real vía WebSocket

---

### RF-06: Colocar Apuesta

| Campo | Detalle |
|---|---|
| **ID** | RF-06 |
| **Módulo** | Apuestas |
| **Prioridad** | Crítica |

**Entradas:**
- `eventId` — ID del evento
- `horseId` — ID del caballo seleccionado
- `type` — tipo de apuesta: `WINNER` o `HEAD_TO_HEAD`
- `amount` — monto en COP
- `opponentHorseId` — requerido solo para `HEAD_TO_HEAD`

**Validaciones (en orden):**
1. Todos los campos requeridos presentes
2. Tipo de apuesta válido
3. Para HEAD_TO_HEAD: opponentHorseId presente y diferente de horseId
4. Monto ≥ 5,000 COP
5. Monto ≤ 2,000,000 COP
6. El evento existe
7. El evento está en estado `UPCOMING` o `LIVE`
8. El caballo está registrado en el evento
9. El caballo oponente está registrado en el evento (HEAD_TO_HEAD)
10. El saldo del usuario es suficiente

**Proceso (transacción atómica):**
1. Descontar monto del saldo del usuario
2. Crear registro en `transactions` (tipo: `BET_PLACED`)
3. Crear registro en `bets` con estado `PENDING`
4. Emitir evento WebSocket `new_bet` a todos los conectados al evento

**Cálculo de ganancia potencial:**
```
potentialPayout = amount × odds
```

---

### RF-07: Historial de Apuestas del Usuario

| Campo | Detalle |
|---|---|
| **ID** | RF-07 |
| **Módulo** | Apuestas |
| **Prioridad** | Media |

El usuario puede consultar todas sus apuestas con filtros por estado (`PENDING`, `WON`, `LOST`, etc.) y paginación.

---

### RF-08: Consultar Billetera

| Campo | Detalle |
|---|---|
| **ID** | RF-08 |
| **Módulo** | Billetera |
| **Prioridad** | Alta |

Devuelve el saldo actual y las últimas 20 transacciones del usuario, incluyendo tipo, monto, descripción, referencia y fecha.

---

### RF-09: Depositar Fondos (Simulado)

| Campo | Detalle |
|---|---|
| **ID** | RF-09 |
| **Módulo** | Billetera |
| **Prioridad** | Alta |

**Validaciones:**
- Monto > 0
- Monto mínimo: $10,000 COP
- Monto máximo por transacción: $10,000,000 COP

**Proceso:**
1. Incrementar saldo del usuario
2. Crear registro en `transactions` (tipo: `DEPOSIT`, estado: `COMPLETED`)
3. Generar referencia única

> En producción, este flujo se reemplazará por integración con PSE o Nequi.

---

### RF-10: Retirar Fondos (Simulado)

| Campo | Detalle |
|---|---|
| **ID** | RF-10 |
| **Módulo** | Billetera |
| **Prioridad** | Alta |

**Validaciones:**
- Monto > 0
- Saldo suficiente

**Proceso:**
1. Verificar saldo disponible
2. Decrementar saldo
3. Crear registro en `transactions` (tipo: `WITHDRAWAL`)

---

### RF-11: Crear Evento (Admin)

| Campo | Detalle |
|---|---|
| **ID** | RF-11 |
| **Módulo** | Administración |
| **Prioridad** | Alta |

**Campos requeridos:** `name`, `type`, `date`, `venue`, `city`

**Campos opcionales:** `description`, `imageUrl`

Al crear un evento, el sistema emite un evento WebSocket `new_event` a todos los clientes conectados.

---

### RF-12: Crear Caballo (Admin)

| Campo | Detalle |
|---|---|
| **ID** | RF-12 |
| **Módulo** | Administración |
| **Prioridad** | Alta |

**Campos requeridos:** `name`, `breed`, `age`, `jockey`

**Campos opcionales:** `color`, `trainer`, `owner`, `imageUrl`, `stats`

Las estadísticas (`stats`) se almacenan como JSON con estructura:
```json
{
  "wins": 0,
  "losses": 0,
  "totalRaces": 0,
  "avgSpeed": 0
}
```

---

### RF-13: Asignar Caballo a Evento con Cuota (Admin)

| Campo | Detalle |
|---|---|
| **ID** | RF-13 |
| **Módulo** | Administración |
| **Prioridad** | Alta |

**Entradas:** `eventId`, `horseId`, `position`, `odds`

**Validaciones:**
- Los IDs deben existir en la base de datos
- `odds` debe estar entre 1.01 y 100.00
- Un caballo no puede estar dos veces en el mismo evento (clave única compuesta)

Al actualizar cuotas, el sistema emite `odds_updated` vía WebSocket.

---

### RF-14: Liquidar Evento (Admin)

| Campo | Detalle |
|---|---|
| **ID** | RF-14 |
| **Módulo** | Administración |
| **Prioridad** | Crítica |

**Entradas:** `eventId`, `winnerHorseId`

**Proceso (transacción atómica):**
1. Marcar el caballo ganador en `horse_on_events`
2. Buscar todas las apuestas `WINNER` al caballo ganador → pagar `potentialPayout`
3. Buscar todas las apuestas `HEAD_TO_HEAD` al caballo ganador → pagar `potentialPayout`
4. Marcar todas las demás apuestas `PENDING` como `LOST`
5. Crear transacciones de tipo `BET_WON` en las billeteras ganadoras
6. Actualizar estado del evento a `FINISHED`
7. Emitir `event_settled` vía WebSocket

---

### RF-15: Tiempo Real — Cuotas en Vivo

| Campo | Detalle |
|---|---|
| **ID** | RF-15 |
| **Módulo** | WebSocket |
| **Prioridad** | Media |

Para eventos con estado `LIVE`, el servidor simula fluctuaciones de cuotas cada 30 segundos (±5% aleatorio). Las actualizaciones se emiten al room específico del evento:

```
Evento: odds_updated
Payload: { eventId, horseId, horseName, odds }
```

**Rooms WebSocket:**
- `event:{eventId}` — para actualizaciones específicas de un evento
- `user:{userId}` — para notificaciones personales

---

### RF-16: Perfil de Usuario

| Campo | Detalle |
|---|---|
| **ID** | RF-16 |
| **Módulo** | Perfil |
| **Prioridad** | Media |

El usuario puede:
- Ver sus datos personales
- Ver estadísticas agregadas por estado de apuesta
- Ver sus últimas 5 apuestas
- Editar nombre y teléfono
- Cambiar contraseña (requiere contraseña actual)

---

## 5. Requerimientos No Funcionales

### RNF-01: Rendimiento

- Tiempo de respuesta de API: < 500 ms en el 95% de las solicitudes
- Tiempo de respuesta para consulta de eventos: < 300 ms
- La transacción de apuesta (incluyendo escritura en DB) debe completarse en < 800 ms
- El servidor debe soportar mínimo 200 conexiones WebSocket concurrentes en MVP

### RNF-02: Disponibilidad

- Objetivo de disponibilidad: 99.5% en horario de eventos (viernes a domingo)
- El sistema debe manejar caídas de base de datos con mensajes de error claros
- Reconexión automática de WebSocket en cliente móvil (máx. 5 intentos)

### RNF-03: Seguridad

- Las contraseñas se almacenan exclusivamente como hashes bcrypt con salt rounds = 12
- Los tokens JWT expiran en 7 días y deben renovarse mediante nuevo login
- El `JWT_SECRET` nunca se incluye en código fuente; se configura vía variable de entorno
- Los tokens se almacenan en `expo-secure-store` (almacenamiento cifrado del dispositivo), no en AsyncStorage
- Todas las rutas privadas validan el token antes de ejecutar lógica de negocio
- Las rutas de administración verifican el rol `ADMIN` explícitamente

### RNF-04: Consistencia de Datos

- Las operaciones de apuesta y pago de ganancias se ejecutan dentro de transacciones de base de datos (`prisma.$transaction`)
- No puede existir saldo negativo en ninguna billetera
- Toda modificación de saldo genera un registro en `transactions`

### RNF-05: Usabilidad

- La aplicación móvil debe funcionar en iOS 14+ y Android 10+ (API 29+)
- El tema oscuro es obligatorio para reducir fatiga visual en ambientes de competencia (estadios, ferias)
- Los montos en COP se muestran con formato regional colombiano: `$5.000`, `$1.500.000`
- Los mensajes de error deben ser en español colombiano, claros y accionables

### RNF-06: Mantenibilidad

- Todo el código en TypeScript con tipado estricto (`strict: true`)
- Separación de responsabilidades: controladores no acceden directamente a Prisma (la lógica compleja irá a servicios en versiones futuras)
- Variables de entorno para toda configuración sensible (DB, JWT, puertos)

### RNF-07: Escalabilidad

- La arquitectura sin estado (stateless JWT) permite escalar horizontalmente el backend
- Las conexiones WebSocket deben migrarse a Redis Adapter (Socket.io) cuando haya múltiples instancias del servidor
- Prisma Connection Pool configurable vía `DATABASE_URL`

---

## 6. Modelo de Datos

### 6.1 Diagrama de Entidades

```
users ──────────── wallets ──────────── transactions
  │                                          │
  │                                          │ (FK: bet_id)
  └──────────── bets ◄────────────────────────
                │  │
                │  └──────── horses (horse_id)
                │  └──────── horses (opponent_horse_id)
                │
                └──────────── events
                                │
                          horse_on_events
                          ┌──────┴──────┐
                        events        horses
```

### 6.2 Tabla: `users`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, default uuid() | Identificador único |
| `email` | VARCHAR | UNIQUE, NOT NULL | Correo electrónico |
| `password` | VARCHAR | NOT NULL | Hash bcrypt |
| `firstName` | VARCHAR | NOT NULL | Nombre |
| `lastName` | VARCHAR | NOT NULL | Apellido |
| `phone` | VARCHAR | NULL | Teléfono opcional |
| `role` | ENUM | NOT NULL, default USER | USER o ADMIN |
| `isActive` | BOOLEAN | NOT NULL, default true | Estado de la cuenta |
| `createdAt` | TIMESTAMP | NOT NULL, default now() | Fecha de creación |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

### 6.3 Tabla: `wallets`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `userId` | UUID | FK users.id, UNIQUE | Relación 1:1 con usuario |
| `balance` | DECIMAL(18,2) | NOT NULL, default 0 | Saldo en COP |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha de creación |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

**Restricción de negocio:** `balance` nunca puede ser negativo (controlado en la capa de aplicación).

### 6.4 Tabla: `transactions`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `walletId` | UUID | FK wallets.id | Billetera relacionada |
| `amount` | DECIMAL(18,2) | NOT NULL | Monto de la transacción |
| `type` | ENUM | NOT NULL | Ver tipos abajo |
| `status` | ENUM | NOT NULL, default COMPLETED | PENDING, COMPLETED, FAILED |
| `description` | VARCHAR | NULL | Descripción opcional |
| `reference` | VARCHAR | UNIQUE, NULL | Referencia única generada |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha |

**Tipos de transacción:** `DEPOSIT`, `WITHDRAWAL`, `BET_PLACED`, `BET_WON`, `BET_REFUND`

### 6.5 Tabla: `events`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `name` | VARCHAR | NOT NULL | Nombre del evento |
| `type` | ENUM | NOT NULL | PASO_FINO, TROCHA_PURA, TROTE_Y_GALOPE |
| `status` | ENUM | NOT NULL, default UPCOMING | UPCOMING, LIVE, FINISHED, CANCELLED |
| `date` | TIMESTAMP | NOT NULL | Fecha y hora del evento |
| `venue` | VARCHAR | NOT NULL | Nombre de la sede |
| `city` | VARCHAR | NOT NULL | Ciudad |
| `description` | TEXT | NULL | Descripción del evento |
| `imageUrl` | VARCHAR | NULL | URL de imagen |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha de creación |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

### 6.6 Tabla: `horses`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `name` | VARCHAR | NOT NULL | Nombre del caballo |
| `breed` | VARCHAR | NOT NULL | Raza / disciplina |
| `age` | INTEGER | NOT NULL | Edad en años |
| `color` | VARCHAR | NULL | Color o pelaje |
| `jockey` | VARCHAR | NOT NULL | Nombre del jinete |
| `trainer` | VARCHAR | NULL | Entrenador |
| `owner` | VARCHAR | NULL | Propietario |
| `stats` | JSON | NULL | Estadísticas: wins, losses, totalRaces, avgSpeed |
| `imageUrl` | VARCHAR | NULL | URL de imagen |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha de creación |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

### 6.7 Tabla: `horse_on_events` (tabla de unión)

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `eventId` | UUID | FK events.id | Evento |
| `horseId` | UUID | FK horses.id | Caballo |
| `position` | INTEGER | NOT NULL | Número de posición/carril |
| `odds` | DECIMAL(6,2) | NOT NULL | Cuota (ej: 2.50 = 2.5x) |
| `isWinner` | BOOLEAN | NOT NULL, default false | Marcado al liquidar |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

**Clave única compuesta:** `(eventId, horseId)` — un caballo no puede aparecer dos veces en el mismo evento.

### 6.8 Tabla: `bets`

| Columna | Tipo | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK | Identificador único |
| `userId` | UUID | FK users.id | Usuario apostador |
| `eventId` | UUID | FK events.id | Evento |
| `horseId` | UUID | FK horses.id | Caballo principal |
| `opponentHorseId` | UUID | FK horses.id, NULL | Caballo oponente (HEAD_TO_HEAD) |
| `transactionId` | UUID | FK transactions.id, UNIQUE | Transacción de débito |
| `type` | ENUM | NOT NULL | WINNER, HEAD_TO_HEAD |
| `status` | ENUM | NOT NULL, default PENDING | PENDING, WON, LOST, CANCELLED, REFUNDED |
| `amount` | DECIMAL(18,2) | NOT NULL | Monto apostado en COP |
| `odds` | DECIMAL(6,2) | NOT NULL | Cuota al momento de apostar |
| `potentialPayout` | DECIMAL(18,2) | NOT NULL | Ganancia potencial (amount × odds) |
| `actualPayout` | DECIMAL(18,2) | NULL | Pago real al liquidar |
| `createdAt` | TIMESTAMP | NOT NULL | Fecha |
| `updatedAt` | TIMESTAMP | NOT NULL | Última actualización |

### 6.9 Enumeraciones

```
Role:              USER | ADMIN
EventType:         PASO_FINO | TROCHA_PURA | TROTE_Y_GALOPE
EventStatus:       UPCOMING | LIVE | FINISHED | CANCELLED
BetType:           WINNER | HEAD_TO_HEAD
BetStatus:         PENDING | WON | LOST | CANCELLED | REFUNDED
TransactionType:   DEPOSIT | WITHDRAWAL | BET_PLACED | BET_WON | BET_REFUND
TransactionStatus: PENDING | COMPLETED | FAILED
```

---

## 7. Diseño de API REST

### 7.1 Convenciones

- Base URL: `http://localhost:3000` (desarrollo)
- Todas las respuestas en JSON
- Formato de respuesta estándar:

```json
{
  "success": true | false,
  "message": "Descripción opcional",
  "data": { ... } | [ ... ],
  "pagination": { "total": 0, "page": 1, "limit": 10, "totalPages": 1 }
}
```

- Los errores retornan `success: false` y el código HTTP correspondiente
- Rutas protegidas requieren header: `Authorization: Bearer <token>`

### 7.2 Endpoints de Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register` | No | Registrar nuevo usuario |
| POST | `/auth/login` | No | Iniciar sesión |
| GET | `/auth/me` | Sí | Obtener usuario autenticado |

**POST /auth/register**
```json
// Request Body
{
  "email": "juan@ejemplo.com",
  "password": "MiPassword123",
  "firstName": "Juan",
  "lastName": "Caballero",
  "phone": "+573001234567"
}

// Response 201
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "uuid", "email": "...", "firstName": "...", "role": "USER", "wallet": { "balance": 0 } }
  }
}
```

**POST /auth/login**
```json
// Request Body
{ "email": "juan@ejemplo.com", "password": "MiPassword123" }

// Response 200
{
  "success": true,
  "data": { "token": "eyJhbGci...", "user": { ... } }
}
```

### 7.3 Endpoints de Eventos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/events` | Sí | Listar eventos (paginado, filtrable) |
| GET | `/events/:id` | Sí | Detalle de un evento con caballos y cuotas |

**GET /events** — Parámetros opcionales: `?status=UPCOMING&type=PASO_FINO&page=1&limit=10`

### 7.4 Endpoints de Apuestas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/bets` | Sí | Colocar una apuesta |
| GET | `/bets/my` | Sí | Historial de apuestas del usuario |

**POST /bets**
```json
// Request Body — Apuesta ganador
{
  "eventId": "uuid-del-evento",
  "horseId": "uuid-del-caballo",
  "type": "WINNER",
  "amount": 50000
}

// Request Body — Cara a cara
{
  "eventId": "uuid-del-evento",
  "horseId": "uuid-caballo-favorito",
  "opponentHorseId": "uuid-caballo-rival",
  "type": "HEAD_TO_HEAD",
  "amount": 100000
}

// Response 201
{
  "success": true,
  "data": {
    "bet": {
      "id": "uuid",
      "type": "WINNER",
      "status": "PENDING",
      "amount": 50000,
      "odds": 2.5,
      "potentialPayout": 125000,
      "horse": { "name": "Lucero del Valle" },
      "event": { "name": "Gran Premio Antioqueño" }
    },
    "newBalance": 450000
  }
}
```

### 7.5 Endpoints de Billetera

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/wallet` | Sí | Consultar saldo e historial |
| POST | `/wallet/deposit` | Sí | Depositar fondos |
| POST | `/wallet/withdraw` | Sí | Retirar fondos |

**POST /wallet/deposit** — Body: `{ "amount": 200000 }`

### 7.6 Endpoints de Perfil

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/profile` | Sí | Perfil completo con estadísticas |
| PATCH | `/profile` | Sí | Actualizar datos personales |
| POST | `/profile/change-password` | Sí | Cambiar contraseña |

### 7.7 Endpoints de Administración

Todos requieren rol `ADMIN`.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/admin/events` | Admin | Crear evento |
| PATCH | `/admin/events/:id/status` | Admin | Actualizar estado del evento |
| POST | `/admin/horses` | Admin | Crear caballo |
| GET | `/admin/horses` | Admin | Listar todos los caballos |
| POST | `/admin/events/assign-horse` | Admin | Asignar caballo a evento con cuota |
| POST | `/admin/events/settle` | Admin | Liquidar evento y pagar ganadores |

**POST /admin/events/assign-horse**
```json
{
  "eventId": "uuid-evento",
  "horseId": "uuid-caballo",
  "position": 1,
  "odds": 2.50
}
```

**POST /admin/events/settle**
```json
{
  "eventId": "uuid-evento",
  "winnerHorseId": "uuid-caballo-ganador"
}
```

### 7.8 Códigos de Error HTTP

| Código | Significado | Ejemplo |
|---|---|---|
| 400 | Bad Request | Monto fuera de rango, campo faltante |
| 401 | Unauthorized | Token ausente o expirado |
| 403 | Forbidden | Ruta de admin sin rol ADMIN |
| 404 | Not Found | Evento o caballo no existe |
| 409 | Conflict | Email ya registrado |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## 8. Reglas de Negocio

### RN-01: Límites de Apuesta
- El monto mínimo por apuesta es **$5,000 COP**
- El monto máximo por apuesta es **$2,000,000 COP**
- No se admiten apuestas con monto = 0 ni montos negativos

### RN-02: Saldo Suficiente
- El sistema debe verificar que `wallet.balance >= bet.amount` antes de cualquier débito
- Si el saldo es insuficiente, la apuesta se rechaza con mensaje claro del saldo actual

### RN-03: Ventana de Apuestas
- Solo se aceptan apuestas en eventos con estado `UPCOMING` o `LIVE`
- Los eventos `FINISHED` y `CANCELLED` no aceptan nuevas apuestas

### RN-04: Integridad de Apuesta Cara a Cara
- En `HEAD_TO_HEAD`, el `horseId` y `opponentHorseId` no pueden ser el mismo caballo
- Ambos caballos deben estar registrados en el mismo evento

### RN-05: Cuotas
- La cuota mínima es 1.01 (siempre hay ganancia mínima)
- La cuota máxima es 100.00
- La cuota se captura en el momento de la apuesta y no cambia aunque las cuotas en vivo fluctúen posteriormente
- `potentialPayout = amount × odds` (redondeado a 2 decimales)

### RN-06: Billetera Única
- Cada usuario tiene exactamente una billetera, creada automáticamente al registrarse
- El saldo nunca puede ser negativo en la base de datos

### RN-07: Trazabilidad
- Toda operación que modifique el saldo genera obligatoriamente un registro en `transactions`
- Los tipos de transacción reflejan la causa del movimiento (no hay movimientos sin justificación)

### RN-08: Liquidación de Eventos
- Solo un administrador puede liquidar un evento
- Al liquidar, exactamente un caballo se marca como ganador
- Las apuestas `WINNER` al caballo ganador se pagan con `potentialPayout`
- Las apuestas `HEAD_TO_HEAD` al caballo ganador también se pagan
- Las apuestas `HEAD_TO_HEAD` al caballo perdedor se marcan como `LOST`
- Las apuestas a cualquier otro caballo se marcan como `LOST`
- El pago se realiza en la misma transacción atómica que la liquidación

### RN-09: Roles
- Un usuario con rol `USER` no puede acceder a ningún endpoint `/admin/*`
- Un administrador puede apostar como usuario normal (doble rol)

### RN-10: Depósitos y Retiros (MVP)
- Mínimo de depósito: $10,000 COP
- Máximo de depósito por operación: $10,000,000 COP
- No hay límite de retiro mientras haya saldo suficiente
- Todas las operaciones son simuladas; no hay integración real de pago en esta versión

---

## 9. Flujos de Usuario

### 9.1 Flujo de Registro y Primera Apuesta

```
1. Usuario abre la app
2. Selecciona "Registrarse"
3. Completa: nombre, apellido, email, contraseña
4. El sistema crea cuenta + billetera con $0
5. Redirige a pantalla Home (lista de eventos)
6. Usuario ve un evento próximo
7. Va a Wallet → Depositar → ingresa $200,000
8. El saldo queda en $200,000
9. Vuelve a Home → selecciona evento → ve lista de caballos
10. Toca "Apostar" en un caballo (cuota 2.5x)
11. Selecciona tipo: Ganador
12. Ingresa $50,000
13. Ve resumen: apostando $50,000 → ganancia potencial $125,000
14. Confirma apuesta
15. Saldo queda en $150,000
16. La apuesta aparece en "Mis Apuestas" como PENDIENTE
```

### 9.2 Flujo de Liquidación (Administrador)

```
1. Admin inicia sesión → obtiene token con role ADMIN
2. El evento termina
3. Admin llama: PATCH /admin/events/{id}/status → { status: "FINISHED" }
4. Admin llama: POST /admin/events/settle → { eventId, winnerHorseId }
5. El sistema:
   a. Marca al caballo ganador
   b. Paga a todos los apostadores ganadores (actualiza saldos)
   c. Crea registros de transacción BET_WON
   d. Marca apuestas perdedoras como LOST
   e. Emite evento WebSocket "event_settled"
6. Los usuarios ven sus apuestas actualizadas en "Mis Apuestas"
```

### 9.3 Flujo WebSocket — Evento en Vivo

```
1. Usuario entra al detalle de un evento con status LIVE
2. La app emite: socket.emit("join_event", eventId)
3. La app escucha: socket.on("odds_updated", callback)
4. El servidor actualiza cuotas cada 30 segundos
5. La UI muestra las nuevas cuotas resaltadas brevemente
6. Al salir del evento, la app emite: socket.emit("leave_event", eventId)
```

---

## 10. Seguridad

### 10.1 Autenticación y Autorización

- **Algoritmo JWT:** HS256 con clave secreta configurada por variable de entorno
- **Expiración del token:** 7 días (configurable)
- **Almacenamiento en cliente:** `expo-secure-store` (cifrado a nivel de sistema operativo)
- **Verificación en cada request:** El middleware `authenticate` valida firma y expiración en toda ruta protegida

### 10.2 Contraseñas

- Hash con **bcrypt**, salt rounds = 12
- Nunca se almacena ni retorna la contraseña en texto plano
- La comparación usa `bcrypt.compare` (resistente a timing attacks)

### 10.3 Validación de Entradas

- Todos los campos se validan en la capa de controlador antes de acceder a la base de datos
- Los montos se convierten explícitamente a `Number` para prevenir inyecciones de tipo
- Los IDs se usan como strings UUID opacos; Prisma los valida como claves foráneas

### 10.4 Variables de Entorno

Nunca en código fuente:
```
DATABASE_URL     → cadena de conexión PostgreSQL
JWT_SECRET       → clave de firma JWT (mínimo 32 caracteres en producción)
JWT_EXPIRES_IN   → duración del token
PORT             → puerto del servidor
```

### 10.5 CORS

El servidor está configurado con `cors()` para desarrollo. En producción, se debe restringir a los dominios de la aplicación.

### 10.6 Transacciones Atómicas

Las operaciones críticas (apostar, pagar ganancias) se ejecutan dentro de `prisma.$transaction()`. Si cualquier paso falla, toda la operación se revierte automáticamente, evitando estados inconsistentes.

---

## 11. Restricciones y Supuestos

### 11.1 Restricciones Técnicas

| Restricción | Detalle |
|---|---|
| Sin pagos reales | MVP usa depósitos y retiros simulados |
| Sin KYC | No hay verificación de identidad en esta versión |
| Sin panel web de admin | La administración se hace vía API (Postman/curl) |
| Sin push notifications | Las alertas son solo vía WebSocket mientras la app está abierta |
| Sin imágenes reales | `imageUrl` se almacena como string; no hay servidor de archivos |

### 11.2 Supuestos

- Los usuarios son mayores de 18 años (sin validación técnica en MVP)
- Se asume conectividad a internet para todas las funciones
- Las competencias son presenciales; PasoBet no transmite video
- El administrador opera desde un entorno seguro (no se expone UI pública de admin)
- La moneda es exclusivamente COP (Pesos Colombianos)

---

## 12. Criterios de Aceptación

### CA-01: Autenticación

- [ ] Un usuario nuevo puede registrarse con email y contraseña
- [ ] Al registrarse, se crea automáticamente una billetera con saldo $0
- [ ] El login retorna un token JWT válido
- [ ] Las rutas protegidas rechazan requests sin token con HTTP 401
- [ ] Las rutas de admin rechazan usuarios con rol USER con HTTP 403

### CA-02: Eventos

- [ ] Se puede obtener la lista de eventos con paginación
- [ ] Los filtros por tipo y estado funcionan correctamente
- [ ] El detalle de un evento incluye la lista de caballos con sus cuotas
- [ ] Un evento inexistente retorna HTTP 404

### CA-03: Apuestas

- [ ] No se puede apostar menos de $5,000 COP
- [ ] No se puede apostar más de $2,000,000 COP
- [ ] No se puede apostar si el saldo es insuficiente
- [ ] No se puede apostar en un evento FINISHED o CANCELLED
- [ ] Al apostar, el saldo se descuenta correctamente
- [ ] La apuesta queda registrada con estado PENDING
- [ ] La apuesta HEAD_TO_HEAD requiere dos caballos distintos del mismo evento

### CA-04: Billetera

- [ ] El saldo se actualiza correctamente después de un depósito
- [ ] El saldo se actualiza correctamente después de un retiro
- [ ] No se puede retirar más del saldo disponible
- [ ] Toda operación genera un registro en el historial de transacciones

### CA-05: Liquidación

- [ ] Al liquidar un evento, los apostadores ganadores reciben su pago
- [ ] Los apostadores perdedores ven sus apuestas como LOST
- [ ] El evento pasa a estado FINISHED
- [ ] El saldo de los ganadores se incrementa correctamente

### CA-06: Tiempo Real

- [ ] Un cliente puede conectarse vía WebSocket con su token JWT
- [ ] Al unirse a un room de evento, recibe actualizaciones de cuotas
- [ ] Los eventos nuevos se emiten a todos los clientes conectados

### CA-07: Interfaz Móvil

- [ ] La app compila y corre en Expo Go sin errores
- [ ] El Login y Registro funcionan y navegan correctamente
- [ ] La pantalla Home muestra la lista de eventos desde la API
- [ ] El detalle del evento muestra los caballos con cuotas
- [ ] La pantalla Apostar valida montos y confirma antes de enviar
- [ ] La Billetera muestra el saldo y el historial
- [ ] Mis Apuestas muestra el estado correcto de cada apuesta
- [ ] El Perfil muestra estadísticas del usuario

---

## 13. Glosario

| Término | Definición |
|---|---|
| **Paso Fino** | Disciplina ecuestre colombiana valorada por el finísimo batir de sus andares, declarado Patrimonio Cultural Inmaterial de Colombia |
| **Trocha Pura** | Modalidad de equitación donde el caballo trota de forma lateral simultánea, típica de los Llanos Orientales |
| **Trote y Galope** | Modalidad mixta donde el caballo combina trote y galope, común en la Sabana de Bogotá |
| **Cuota (Odds)** | Multiplicador que determina la ganancia. Cuota 2.50 significa que por cada $1 apostado se gana $2.50 |
| **Apuesta Ganador** | El usuario apuesta a que un caballo específico gana el evento |
| **Apuesta Cara a Cara (H2H)** | El usuario apuesta a que el caballo A supera al caballo B, independientemente del resultado general |
| **Potentialidad de pago** | `monto × cuota` — lo que el usuario ganaría si su apuesta es correcta |
| **Liquidación** | Proceso por el cual el administrador declara el ganador y el sistema paga automáticamente |
| **COP** | Peso Colombiano — moneda oficial de Colombia |
| **JWT** | JSON Web Token — estándar para autenticación sin estado |
| **WebSocket** | Protocolo de comunicación bidireccional en tiempo real |
| **MVP** | Minimum Viable Product — versión mínima funcional del producto |
| **KYC** | Know Your Customer — proceso de verificación de identidad (futuro) |

---

## 14. Futuras Mejoras

### Versión 1.1 — Post-MVP inmediato

- [ ] Panel web de administración (React + TypeScript)
- [ ] Push Notifications vía Expo Notifications
- [ ] Imágenes de caballos y eventos (Cloudinary o S3)
- [ ] Apuesta múltiple (parlay) — combinar varios eventos

### Versión 1.2 — Integración de pagos

- [ ] Integración con PSE (pagos bancarios Colombia)
- [ ] Integración con Nequi y Daviplata
- [ ] Integración con Bancolombia a la mano
- [ ] KYC básico (cédula + selfie) mediante proveedor externo

### Versión 2.0 — Escala

- [ ] Streaming de video de eventos (HLS)
- [ ] Sistema de IA para sugerencias de apuestas basadas en historial
- [ ] Modo multijugador — salas privadas de apuestas entre amigos
- [ ] Aplicación web (Next.js) como alternativa al app móvil
- [ ] Panel de analítica para administradores (ganancias, volumen, usuarios activos)
- [ ] Redis Adapter para Socket.io (múltiples instancias de servidor)
- [ ] Rate limiting y protección DDoS (Cloudflare / Kong)
- [ ] Cumplimiento regulatorio Coljuegos (Colombia)

---

*Fin del documento — SRS PasoBet v2.0*
