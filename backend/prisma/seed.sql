-- 1. CREACIÓN DE TABLAS
-- CreateTable
CREATE TABLE IF NOT EXISTS "usuarios" (
    "id" UUID NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "saldo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ferias" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ferias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "categorias_evento" (
    "id" UUID NOT NULL,
    "feria_id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    CONSTRAINT "categorias_evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "caballos" (
    "id" UUID NOT NULL,
    "nombre" TEXT NOT NULL,
    "criadero" TEXT,
    "categoria" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "caballos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "participaciones" (
    "id" UUID NOT NULL,
    "caballo_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    CONSTRAINT "participaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "apuestas" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "categoria_id" UUID NOT NULL,
    "caballo_id" UUID NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "apuestas_pkey" PRIMARY KEY ("id")
);

-- Indices y FKs
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_key" ON "usuarios"("email");
ALTER TABLE "categorias_evento" DROP CONSTRAINT IF EXISTS "categorias_evento_feria_id_fkey";
ALTER TABLE "categorias_evento" ADD CONSTRAINT "categorias_evento_feria_id_fkey" FOREIGN KEY ("feria_id") REFERENCES "ferias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "participaciones" DROP CONSTRAINT IF EXISTS "participaciones_caballo_id_fkey";
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_caballo_id_fkey" FOREIGN KEY ("caballo_id") REFERENCES "caballos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "participaciones" DROP CONSTRAINT IF EXISTS "participaciones_categoria_id_fkey";
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "apuestas" DROP CONSTRAINT IF EXISTS "apuestas_usuario_id_fkey";
ALTER TABLE "apuestas" ADD CONSTRAINT "apuestas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "apuestas" DROP CONSTRAINT IF EXISTS "apuestas_categoria_id_fkey";
ALTER TABLE "apuestas" ADD CONSTRAINT "apuestas_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "apuestas" DROP CONSTRAINT IF EXISTS "apuestas_caballo_id_fkey";
ALTER TABLE "apuestas" ADD CONSTRAINT "apuestas_caballo_id_fkey" FOREIGN KEY ("caballo_id") REFERENCES "caballos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. SEED DE DATOS (IDs de ejemplo)
-- Usuarios (Contraseñas: admin123 y demo123 hasheadas)
INSERT INTO "usuarios" (id, email, password, nombre, role, saldo) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@pasobet.com', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgDtG7U9.4B6A6.H.D.Y.D.Y.D.Y.', 'Administrador PasoBet', 'ADMIN', 500000),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'demo@pasobet.com', '$2a$12$L7R.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.D.Y.', 'Carlos Rodríguez', 'USER', 100000)
ON CONFLICT (email) DO NOTHING;

-- Feria
INSERT INTO "ferias" (id, nombre, lugar, fecha_inicio, fecha_fin, estado) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Gran Feria Equina 2026', 'Centro de Eventos Valle del Lili, Cali', '2026-05-15', '2026-05-20', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Categorías
INSERT INTO "categorias_evento" (id, feria_id, nombre, estado) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Paso Fino Colombiano (P4)', 'abierta'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Trocha y Galope (P2)', 'abierta')
ON CONFLICT (id) DO NOTHING;

-- Caballos
INSERT INTO "caballos" (id, nombre, criadero) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Relámpago Dorado', 'Hacienda El Roble'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Cielo Plateado', 'Finca Las Palmas'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Tornado del Sur', 'Rancho Viento Libre')
ON CONFLICT (id) DO NOTHING;

-- Participaciones
INSERT INTO "participaciones" (id, caballo_id, categoria_id) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15')
ON CONFLICT (id) DO NOTHING;
