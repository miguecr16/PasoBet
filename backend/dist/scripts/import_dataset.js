"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🚀 Iniciando importación masiva con arquitectura de CATEGORÍAS MAESTRAS...');
    const csvPath = path_1.default.join(process.cwd(), '..', 'pasobet_dataset.csv');
    if (!fs_1.default.existsSync(csvPath)) {
        console.error('❌ No se encontró el archivo pasobet_dataset.csv');
        return;
    }
    const content = fs_1.default.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const rows = lines.slice(1);
    // 1. Limpiar todo
    console.log('🗑️ Limpiando base de datos para re-estructuración...');
    await prisma.apuesta.deleteMany();
    await prisma.poolApuestas.deleteMany();
    await prisma.participacion.deleteMany();
    await prisma.competencia.deleteMany();
    await prisma.feria.deleteMany();
    await prisma.categoriaMaestra.deleteMany();
    await prisma.caballo.deleteMany();
    // 2. Crear las 4 Categorías Maestras (Fijas)
    console.log('🏆 Creando las 4 Categorías Maestras fijas...');
    const categoriasNombres = [
        'Trote y Galope (P1)',
        'Trocha y Galope (P2)',
        'Trocha Pura Colombiana (P3)',
        'Paso Fino Colombiano (P4)'
    ];
    const catMaestrasMap = new Map();
    for (const nombre of categoriasNombres) {
        const cat = await prisma.categoriaMaestra.create({ data: { nombre } });
        catMaestrasMap.set(nombre, cat.id);
    }
    const feriasMap = new Map();
    const competenciasMap = new Map();
    const caballosMap = new Map();
    console.log(`📊 Procesando ${rows.length} registros...`);
    for (const row of rows) {
        const parts = row.match(/(".*?"|[^,]+)/g);
        if (!parts || parts.length < 8)
            continue;
        const [fNombre, fLugar, fInicio, fFin, cNombre, hNombre, hCriadero, cCuota] = parts.map(p => p.replace(/"/g, '').trim());
        // Normalizar nombre de categoría para que coincida con las maestras
        let catNombreNormalizado = cNombre;
        if (cNombre.includes('(P1)'))
            catNombreNormalizado = 'Trote y Galope (P1)';
        if (cNombre.includes('(P2)'))
            catNombreNormalizado = 'Trocha y Galope (P2)';
        if (cNombre.includes('(P3)'))
            catNombreNormalizado = 'Trocha Pura Colombiana (P3)';
        if (cNombre.includes('(P4)'))
            catNombreNormalizado = 'Paso Fino Colombiano (P4)';
        // A. Gestionar Feria
        let feriaId = feriasMap.get(fNombre);
        if (!feriaId) {
            const feria = await prisma.feria.create({
                data: {
                    nombre: fNombre,
                    lugar: fLugar,
                    fechaInicio: new Date(fInicio),
                    fechaFin: new Date(fFin)
                }
            });
            feriaId = feria.id;
            feriasMap.set(fNombre, feriaId);
        }
        // B. Gestionar Competencia (Feria + Categoria Maestra)
        const catMaestraId = catMaestrasMap.get(catNombreNormalizado);
        if (!catMaestraId)
            continue;
        const compKey = `${feriaId}_${catMaestraId}`;
        let competenciaId = competenciasMap.get(compKey);
        if (!competenciaId) {
            const comp = await prisma.competencia.create({
                data: {
                    feriaId: feriaId,
                    categoriaId: catMaestraId,
                    estado: 'abierta'
                }
            });
            competenciaId = comp.id;
            competenciasMap.set(compKey, competenciaId);
        }
        // C. Gestionar Caballo
        let caballoId = caballosMap.get(hNombre);
        if (!caballoId) {
            const caballo = await prisma.caballo.create({
                data: {
                    nombre: hNombre,
                    criadero: hCriadero,
                    cuotaBase: parseFloat(cCuota) || 2.0,
                    cuotaActual: parseFloat(cCuota) || 2.0
                }
            });
            caballoId = caballo.id;
            caballosMap.set(hNombre, caballoId);
        }
        // D. Crear Participación y Pool
        await prisma.participacion.create({
            data: {
                competenciaId: competenciaId,
                caballoId: caballoId
            }
        });
        await prisma.poolApuestas.create({
            data: {
                competenciaId: competenciaId,
                caballoId: caballoId,
                totalApostado: 0
            }
        });
    }
    console.log('✅ Importación finalizada con éxito con el nuevo esquema.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
