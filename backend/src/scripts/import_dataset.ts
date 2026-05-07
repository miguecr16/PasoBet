import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCsvLine(line: string) {
  const values = line.match(/(".*?"|[^,]+)/g);
  return values ? values.map((value) => value.replace(/^"|"$/g, '').trim()) : [];
}

async function main() {
  console.log('🚀 Iniciando importación jerárquica profunda...');

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

  console.log('🗑️ Limpiando datos operativos...');
  await prisma.apuesta.deleteMany();
  await prisma.poolApuestas.deleteMany();
  await prisma.participacion.deleteMany();
  await prisma.competencia.deleteMany();
  await prisma.feria.deleteMany();
  await prisma.caballo.deleteMany();

  // Precargar jerarquías para eficiencia
  const dbModalities = await prisma.competitionModality.findMany();
  const dbSexes = await prisma.competitionSex.findMany();
  const dbAgeRanges = await prisma.competitionAgeRange.findMany();
  const dbCategories = await prisma.competitionCategory.findMany();

  const feriasMap = new Map<string, string>();
  const competicionesMap = new Map<string, string>();

  console.log('📊 Procesando registros...');
  for (const row of rows) {
    const values = parseCsvLine(row);
    if (values.length < 5) continue;

    const record: Record<string, string> = {};
    header.forEach((col, i) => { record[col] = values[i] || ''; });

    // 1. Identificar Modalidad
    const catName = (record['categoria_nombre'] || record['categoria_completa'] || '').toLowerCase();
    let modObj = dbModalities.find(m => catName.includes(m.slug) || catName.includes(m.nombre.toLowerCase()));
    
    // Fallback manual para formatos antiguos P1-P4
    if (!modObj) {
      if (catName.includes('(p4)') || catName.includes('fino')) modObj = dbModalities.find(m => m.slug === 'paso-fino');
      else if (catName.includes('(p3)') || catName.includes('trocha pura')) modObj = dbModalities.find(m => m.slug === 'trocha');
      else if (catName.includes('(p2)') || catName.includes('trocha y galope')) modObj = dbModalities.find(m => m.slug === 'trocha-y-galope');
      else if (catName.includes('(p1)') || catName.includes('trote y galope')) modObj = dbModalities.find(m => m.slug === 'trote-y-galope');
    }
    if (!modObj) modObj = dbModalities[0]; // Fallback final

    // 2. Identificar Sexo
    const sexoRaw = (record['sexo'] || '').toLowerCase();
    const sexoObj = dbSexes.find(s => sexoRaw.includes('hembra') || sexoRaw.includes('yegua')) 
                    ? dbSexes.find(s => s.nombre.toLowerCase().includes('hembra'))
                    : dbSexes.find(s => s.nombre.toLowerCase().includes('macho'));
    
    if (!sexoObj) continue;

    // 3. Identificar Rango de Edad
    const edadMeses = parseInt(record['edad_meses'] || record['edad_min']) || 36;
    const ageObj = dbAgeRanges.find(a => edadMeses >= a.edadMin && (a.edadMax === null || edadMeses < a.edadMax))
                   || dbAgeRanges[0];

    // 4. Encontrar Categoría de Unión
    const category = dbCategories.find(c => 
      c.modalidadId === modObj!.id && 
      c.sexoId === sexoObj.id && 
      c.rangoEdadId === ageObj.id
    );

    if (!category) continue;

    // 5. Feria
    const feriaNombre = record['feria_nombre'] || record['feria'] || 'Feria Fedequinas';
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

    // 6. Competencia
    const compKey = `${feriaId}_${category.id}`;
    let compId = competicionesMap.get(compKey);
    if (!compId) {
      const comp = await prisma.competencia.create({
        data: { feriaId, categoriaId: category.id, estado: 'abierta' }
      });
      compId = comp.id;
      competicionesMap.set(compKey, compId);
    }

    // 7. Caballo y Participación
    const caballo = await prisma.caballo.create({
      data: {
        nombre: record['caballo_nombre'] || record['caballo'] || 'Sin Nombre',
        criadero: record['caballo_criadero'] || record['criadero'],
        sexo: sexoObj.nombre,
        edadMeses: edadMeses,
        cuotaBase: parseFloat(record['cuota_base'] || record['cuota']) || 2.0,
        cuotaActual: parseFloat(record['cuota_base'] || record['cuota']) || 2.0,
      }
    });

    await prisma.participacion.create({ data: { competenciaId: compId, caballoId: caballo.id } });
    await prisma.poolApuestas.create({ data: { competenciaId: compId, caballoId: caballo.id, totalApostado: 0 } });
  }

  console.log('✅ Importación jerárquica finalizada con éxito.');
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(() => prisma.$disconnect());
