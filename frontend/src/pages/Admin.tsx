import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import type { Category, Feria, Horse, ModalityNode, SexNode } from '../types';
import { 
  Plus, 
  Award, 
  Building2, 
  Sparkles, 
  ArrowUpRight, 
  Zap, 
  Repeat, 
  MoveRight, 
  MoveUp, 
  Target,
  Users,
  Settings2,
  ChevronRight
} from 'lucide-react';

interface AdminFeria extends Feria {
  competencias?: Array<{
    id: string;
    estado: string;
    categoria: Category;
  }>;
}

export const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [ferias, setFerias] = useState<AdminFeria[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  
  // Hierarchical Options
  const [modalities, setModalities] = useState<any[]>([]);
  const [sexes, setSexes] = useState<any[]>([]);
  const [ageRanges, setAgeRanges] = useState<any[]>([]);

  // Selection State
  const [selectedFeriaId, setSelectedFeriaId] = useState('');
  const [selectedModalityId, setSelectedModalityId] = useState('');
  const [selectedSexoId, setSelectedSexoId] = useState('');
  const [selectedAgeRangeId, setSelectedAgeRangeId] = useState('');
  
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [selectedHorseId, setSelectedHorseId] = useState('');
  
  const [newFeria, setNewFeria] = useState({ name: '', location: '', startDate: '', endDate: '' });
  const [newHorse, setNewHorse] = useState({ name: '', breed: '', sexo: 'Machos', edadMeses: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feriasRes, catsRes, horsesRes] = await Promise.all([
        api.get('/admin/ferias'),
        api.get('/admin/categories'),
        api.get('/admin/horses'),
      ]);

      const feriasData = feriasRes.data.data || [];
      const catsData = catsRes.data.data || [];
      const horsesData = horsesRes.data.data || [];

      setFerias(feriasData);
      setCategories(catsData);
      setHorses(horsesData);
      
      // Extraer metadatos para cascada desde las categorías maestras
      const uniqueMods = new Map();
      const uniqueSexes = new Map();
      const uniqueAges = new Map();

      catsData.forEach((c: any) => {
        if (c.modalidad) uniqueMods.set(c.modalidadId, c.modalidad);
        if (c.sexo) uniqueSexes.set(c.sexoId, c.sexo);
        if (c.rangoEdad) uniqueAges.set(c.rangoEdadId, c.rangoEdad);
      });

      setModalities(Array.from(uniqueMods.values()));
      setSexes(Array.from(uniqueSexes.values()));
      setAgeRanges(Array.from(uniqueAges.values()));

      if (feriasData.length) setSelectedFeriaId(feriasData[0].id);
    } catch (err: any) {
      setError('Error cargando datos maestros');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCategory = async () => {
    // Buscar la categoría que coincide con la selección triple
    const targetCat = categories.find(c => 
      (c as any).modalidadId === selectedModalityId && 
      (c as any).sexoId === selectedSexoId && 
      (c as any).rangoEdadId === selectedAgeRangeId
    );

    if (!selectedFeriaId || !targetCat) {
      setError('Selecciona todos los niveles de la jerarquía');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post(`/admin/ferias/${selectedFeriaId}/categories`, { categoryId: targetCat.id });
      setFerias(ferias.map(f => f.id === selectedFeriaId ? {
        ...f,
        competencias: [...(f.competencias || []), res.data.data]
      } : f));
      setSuccess(`Categoría "${targetCat.nombre}" activada`);
    } catch (err: any) {
      setError('Error al activar categoría');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCreateFeria = async () => {
    try {
      setSaving(true);
      const res = await api.post('/admin/events', newFeria);
      setFerias([...ferias, { ...res.data.data, competencias: [] }]);
      setNewFeria({ name: '', location: '', startDate: '', endDate: '' });
      setSuccess('Feria profesional creada');
    } catch (err: any) {
      setError('Error al crear la feria');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleCreateHorse = async () => {
    try {
      setSaving(true);
      const res = await api.post('/admin/horses', {
        ...newHorse,
        edadMeses: Number(newHorse.edadMeses)
      });
      setHorses([...horses, res.data.data]);
      setNewHorse({ name: '', breed: '', sexo: 'Machos', edadMeses: '' });
      setSuccess('Caballo registrado exitosamente');
    } catch (err: any) {
      setError('Error al registrar caballo');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAssignHorse = async () => {
    if (!selectedCompetitionId || !selectedHorseId) return;
    try {
      setSaving(true);
      await api.post('/admin/events/assign-horse', { eventId: selectedCompetitionId, horseId: selectedHorseId });
      setSuccess('Caballo asignado a la competencia');
    } catch (err: any) {
      setError('Error al asignar caballo');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <Spinner size={48} color="var(--brand-green)" />
        <p className="text-xl font-black text-brand-green uppercase tracking-widest animate-pulse">Iniciando Panel Maestro</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-12 animate-fadeIn pb-32">
      {/* ── Header ── */}
      <div className="bg-brand-green p-10 rounded-[40px] text-white shadow-2xl border-b-8 border-brand-gold relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <Settings2 className="text-brand-gold" size={32} />
            <h1 className="text-4xl font-black uppercase tracking-tighter">Panel de Control</h1>
          </div>
          <p className="text-brand-gold/60 font-black tracking-[0.3em] uppercase text-xs ml-12">
            Gestión Jerárquica Profesional • PasoBet Core v2
          </p>
        </div>
        <Building2 className="absolute right-[-40px] bottom-[-40px] opacity-5 text-white group-hover:scale-110 transition-transform duration-700" size={240} />
      </div>

      {/* ── Alerts ── */}
      {(error || success) && (
        <div className={`fixed bottom-8 right-8 z-50 p-6 rounded-2xl shadow-2xl animate-slideUp font-black uppercase text-xs tracking-widest border-l-8 ${
          error ? 'bg-white text-red-600 border-red-600' : 'bg-brand-green text-brand-gold border-brand-gold'
        }`}>
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* ── Feria Section ── */}
        <Card className="p-8 border-none shadow-xl hover:shadow-2xl transition-all rounded-[32px] bg-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-green/10 p-3 rounded-2xl"><Building2 size={24} className="text-brand-green" /></div>
            <h2 className="text-2xl font-black text-brand-green uppercase tracking-tight">Apertura de Feria</h2>
          </div>
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nombre del Evento</label>
              <input className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green focus:ring-2 ring-brand-gold/20 transition-all" placeholder="Ej: Feria Nacional de las Flores" value={newFeria.name} onChange={e => setNewFeria({...newFeria, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Ubicación</label>
              <input className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" placeholder="Ej: Medellín, Antioquia" value={newFeria.location} onChange={e => setNewFeria({...newFeria, location: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Fecha Inicio</label>
                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-brand-green" value={newFeria.startDate} onChange={e => setNewFeria({...newFeria, startDate: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Fecha Fin</label>
                <input type="date" className="w-full bg-gray-50 border-none rounded-2xl p-4 font-black text-brand-green" value={newFeria.endDate} onChange={e => setNewFeria({...newFeria, endDate: e.target.value})} />
              </div>
            </div>
            <Button className="w-full py-5 uppercase font-black tracking-widest text-sm rounded-2xl shadow-lg shadow-brand-green/20" onClick={handleCreateFeria} disabled={saving || !newFeria.name}>Finalizar Registro de Feria</Button>
          </div>
        </Card>

        {/* ── Horse Section ── */}
        <Card className="p-8 border-none shadow-xl hover:shadow-2xl transition-all rounded-[32px] bg-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-gold/10 p-3 rounded-2xl"><Award size={24} className="text-brand-gold" /></div>
            <h2 className="text-2xl font-black text-brand-green uppercase tracking-tight">Registro de Ejemplar</h2>
          </div>
          <div className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Nombre Oficial</label>
              <input className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" placeholder="Ej: Relato de la Ponderosa" value={newHorse.name} onChange={e => setNewHorse({...newHorse, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Criadero</label>
              <input className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" placeholder="Ej: Criadero Villa Maria" value={newHorse.breed} onChange={e => setNewHorse({...newHorse, breed: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Sexo</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={newHorse.sexo} onChange={e => setNewHorse({...newHorse, sexo: e.target.value})}>
                  <option value="Machos">MACHO</option>
                  <option value="Hembras">HEMBRA</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Edad (Meses)</label>
                <input type="number" className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" placeholder="Ej: 48" value={newHorse.edadMeses} onChange={e => setNewHorse({...newHorse, edadMeses: e.target.value})} />
              </div>
            </div>
            <Button className="w-full py-5 uppercase font-black tracking-widest text-sm rounded-2xl shadow-lg shadow-brand-gold/20 bg-brand-gold hover:bg-brand-gold-dark" onClick={handleCreateHorse} disabled={saving || !newHorse.name}>Certificar Ejemplar</Button>
          </div>
        </Card>
      </div>

      {/* ── Assignments Section (Cascading) ── */}
      <Card className="p-10 border-none shadow-2xl rounded-[40px] bg-white">
        <div className="flex items-center gap-6 mb-12 border-b border-gray-100 pb-8">
          <div className="bg-brand-green p-4 rounded-3xl shadow-xl">
            <Users className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-brand-green uppercase tracking-tighter">Gestión de Competencias</h2>
            <p className="text-gray-400 text-sm font-black uppercase tracking-[0.2em]">Navegación Jerárquica Fedequinas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Step 1: Hierarchical Selection */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3 text-brand-gold font-black text-xs uppercase tracking-widest mb-2">
              <span className="bg-brand-gold text-white w-6 h-6 flex items-center justify-center rounded-xl text-[10px]">1</span>
              Jerarquía de Categoría
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Feria Destino</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedFeriaId} onChange={e => setSelectedFeriaId(e.target.value)}>
                  <option value="">Seleccionar Feria</option>
                  {ferias.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Modalidad</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedModalityId} onChange={e => setSelectedModalityId(e.target.value)}>
                  <option value="">Seleccionar Modalidad</option>
                  {modalities.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Sexo</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedSexoId} onChange={e => setSelectedSexoId(e.target.value)}>
                  <option value="">Seleccionar Sexo</option>
                  {sexes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Rango de Edad</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedAgeRangeId} onChange={e => setSelectedAgeRangeId(e.target.value)}>
                  <option value="">Seleccionar Edad</option>
                  {ageRanges.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                </select>
              </div>
            </div>

            <Button className="w-full py-5 uppercase font-black tracking-widest text-sm rounded-2xl bg-brand-green text-white" onClick={handleActivateCategory} disabled={saving || !selectedFeriaId || !selectedModalityId || !selectedSexoId || !selectedAgeRangeId}>
              Activar Categoría en Feria
            </Button>
          </div>

          <div className="hidden lg:block w-[1px] bg-gray-100" />

          {/* Step 2: Participant Assignment */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3 text-brand-gold font-black text-xs uppercase tracking-widest mb-2">
              <span className="bg-brand-gold text-white w-6 h-6 flex items-center justify-center rounded-xl text-[10px]">2</span>
              Asignar Ejemplar
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Competencia Activa</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedCompetitionId} onChange={e => setSelectedCompetitionId(e.target.value)}>
                  <option value="">Seleccionar Competencia</option>
                  {ferias.find(f => f.id === selectedFeriaId)?.competencias?.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.categoria.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4">Ejemplar Registrado</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-5 font-black text-brand-green" value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
                  <option value="">Seleccionar Caballo</option>
                  {horses.map(h => <option key={h.id} value={h.id}>{h.nombre} ({h.sexo} • {h.edadMeses}m)</option>)}
                </select>
              </div>

              <Button className="w-full py-5 uppercase font-black tracking-widest text-sm rounded-2xl bg-brand-gold hover:bg-brand-gold-dark text-white shadow-xl shadow-brand-gold/20" onClick={handleAssignHorse} disabled={saving || !selectedCompetitionId || !selectedHorseId}>
                Confirmar Participación
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
