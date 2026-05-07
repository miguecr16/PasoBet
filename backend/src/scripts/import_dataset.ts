import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCsvLine(line: string) {
  const values = line.match(/(".*?"|[^,]+)/g);
  return values ? values.map((value) => value.replace(/^"|"$/g, '').trim()) : [];
}

async function main() {
  console.log('🚀 Iniciando importación inteligente (Soporta formato antiguo y profesional)...');

  const csvPath = path.join(process.cwd(), '..', 'pasobet_dataset.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ No se encontró el archivo pasobet_dataset.csv');
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  if (lines.length < 2) return;

  const header = parseCsvLine(lines[0]).map((v) => v.toLowerCase());
  const rows = lines.slice(1);

  console.log('📊 Iniciando carga de datos...');
  // await prisma.apuesta.deleteMany();
  // await prisma.poolApuestas.deleteMany();
  // await prisma.participacion.deleteMany();
  // await prisma.competencia.deleteMany();
  // await prisma.feria.deleteMany();
  // await prisma.caballo.deleteMany();

  const masterCategories = await prisma.competitionCategory.findMany();
  const feriasMap = new Map<string, string>();
  const competicionesMap = new Map<string, string>();

  for (const row of rows) {
    const values = parseCsvLine(row);
    if (values.length < 5) continue;

    const record: Record<string, string> = {};
    header.forEach((col, i) => { record[col] = values[i] || ''; });

    // --- Lógica de Extracción de Modalidad ---
    let mod = record['modalidad']?.toUpperCase() || '';
    const catName = record['categoria_nombre'] || record['categoria_completa'] || '';
    
    if (!mod) {
      if (catName.includes('(P4)') || catName.toLowerCase().includes('fino')) mod = 'PASO_FINO';
      else if (catName.includes('(P3)') || catName.toLowerCase().includes('trocha pura')) mod = 'TROCHA';
      else if (catName.includes('(P2)') || catName.toLowerCase().includes('trocha y galope')) mod = 'TROCHA_GALOPE';
      else if (catName.includes('(P1)') || catName.toLowerCase().includes('trote y galope')) mod = 'TROTE_GALOPE';
      else mod = 'TROCHA'; // Fallback
    }

    const sexo = record['sexo']?.toUpperCase().includes('HEMBRA') ? 'HEMBRA' : 'MACHO';
    const edadMin = parseInt(record['edad_min']) || 36;
    const feriaNombre = record['feria_nombre'] || record['feria'] || 'Feria Desconocida';
    const caballoNombre = record['caballo_nombre'] || record['caballo'] || 'Sin Nombre';

    // Buscar Categoría Maestra
    const category = masterCategories.find(c => c.modalidad === mod && c.sexo === sexo && c.edadMin === edadMin) 
                     || masterCategories.find(c => c.modalidad === mod); // Fallback a la primera de la modalidad

    if (!category) continue;

    // Feria
    let feriaId = feriasMap.get(feriaNombre);
    if (!feriaId) {
      const feria = await prisma.feria.create({
        data: {
          nombre: feriaNombre,
          lugar: record['feria_lugar'] || record['lugar'] || 'Colombia',
          fechaInicio: new Date(record['feria_fecha_inicio'] || record['fecha_inicio'] || Date.now()),
          fechaFin: new Date(record['feria_fecha_fin'] || record['fecha_fin'] || Date.now()),
        }
      });
      feriaId = feria.id;
      feriasMap.set(feriaNombre, feriaId);
    }

    // Competencia
    const compKey = `${feriaId}_${category.id}`;
    let compId = competicionesMap.get(compKey);
    if (!compId) {
      const comp = await prisma.competencia.create({
        data: { feriaId, categoriaId: category.id, estado: 'abierta' }
      });
      compId = comp.id;
      competicionesMap.set(compKey, compId);
    }

    // Caballo y Participación
    const caballo = await prisma.caballo.create({
      data: {
        nombre: caballoNombre,
        criadero: record['caballo_criadero'] || record['criadero'],
        sexo,
        edadMeses: edadMin,
        cuotaBase: parseFloat(record['cuota_base'] || record['cuota']) || 2.0,
        cuotaActual: parseFloat(record['cuota_base'] || record['cuota']) || 2.0,
      }
    });

    await prisma.participacion.create({ data: { competenciaId: compId, caballoId: caballo.id } });
    await prisma.poolApuestas.create({ data: { competenciaId: compId, caballoId: caballo.id, totalApostado: 0 } });
  }

  console.log('✅ Importación finalizada con éxito. Sistema profesional listo.');
}



main()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => prisma.$disconnect());
