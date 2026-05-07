import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import type { Category, Feria, Horse } from '../types';
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
  Users
} from 'lucide-react';

interface AdminFeria extends Feria {
  competencias?: Array<{
    id: string;
    estado: string;
    categoria: Category;
  }>;
}

const MODALIDADES_CONFIG: Record<string, { label: string; icon: any }> = {
  PASO_FINO: { label: 'Paso Fino', icon: Zap },
  TROCHA: { label: 'Trocha', icon: Repeat },
  TROCHA_GALOPE: { label: 'Trocha y Galope', icon: MoveRight },
  TROTE_GALOPE: { label: 'Trote y Galope', icon: MoveUp },
  ASNALES_MULARES: { label: 'Asnales y Mulares', icon: Target },
};

export const Admin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [ferias, setFerias] = useState<AdminFeria[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [horses, setHorses] = useState<Horse[]>([]);
  
  const [selectedFeriaId, setSelectedFeriaId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [selectedHorseId, setSelectedHorseId] = useState('');
  
  const [newFeria, setNewFeria] = useState({ name: '', location: '', startDate: '', endDate: '' });
  const [newHorse, setNewHorse] = useState({ name: '', breed: '', sexo: 'MACHO', edadMeses: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feriasRes, categoriesRes, horsesRes] = await Promise.all([
        api.get('/admin/ferias'),
        api.get('/admin/categories'),
        api.get('/admin/horses'),
      ]);
      setFerias(feriasRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setHorses(horsesRes.data.data || []);
      if (feriasRes.data.data?.length) setSelectedFeriaId(feriasRes.data.data[0].id);
    } catch (err: any) {
      setError(err?.message || 'Error cargando datos maestros');
    } finally {
      setLoading(false);
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
      setNewHorse({ name: '', breed: '', sexo: 'MACHO', edadMeses: '' });
      setSuccess('Caballo registrado exitosamente');
    } catch (err: any) {
      setError('Error al registrar caballo');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleActivateCategory = async () => {
    if (!selectedFeriaId || !selectedCategoryId) return;
    try {
      setSaving(true);
      const res = await api.post(`/admin/ferias/${selectedFeriaId}/categories`, { categoryId: selectedCategoryId });
      setFerias(ferias.map(f => f.id === selectedFeriaId ? {
        ...f,
        competencias: [...(f.competencias || []), res.data.data]
      } : f));
      setSuccess('Categoría activada en la feria');
    } catch (err: any) {
      setError('Error al activar categoría');
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-500">
        <Spinner size={40} color="var(--brand-green)" />
        <p className="text-lg font-medium">Cargando Panel Maestro...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto pb-20">
      {/* ── Header ── */}
      <div className="bg-brand-green p-8 rounded-3xl text-white shadow-xl border-b-4 border-brand-gold relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-brand-gold" size={28} />
            <h1 className="text-3xl font-black uppercase tracking-tight">Panel Administrativo</h1>
          </div>
          <p className="text-brand-gold/80 font-medium tracking-wide uppercase text-xs">
            Gestión Profesional Fedequinas • PasoBet Core
          </p>
        </div>
        <Building2 className="absolute right-[-20px] bottom-[-20px] opacity-10 text-white" size={160} />
      </div>

      {/* ── Alerts ── */}
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 font-bold rounded-r-xl">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 font-bold rounded-r-xl">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Feria Section ── */}
        <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-green/10 p-2 rounded-lg"><Building2 size={20} className="text-brand-green" /></div>
            <h2 className="text-xl font-black text-brand-green uppercase">Nueva Feria</h2>
          </div>
          <div className="space-y-4">
            <input className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" placeholder="Nombre de la feria" value={newFeria.name} onChange={e => setNewFeria({...newFeria, name: e.target.value})} />
            <input className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" placeholder="Ubicación" value={newFeria.location} onChange={e => setNewFeria({...newFeria, location: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Inicio</label>
                <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold" value={newFeria.startDate} onChange={e => setNewFeria({...newFeria, startDate: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Fin</label>
                <input type="date" className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold" value={newFeria.endDate} onChange={e => setNewFeria({...newFeria, endDate: e.target.value})} />
              </div>
            </div>
            <Button className="w-full py-4 uppercase font-black tracking-widest text-xs" onClick={handleCreateFeria} disabled={saving || !newFeria.name}>Crear Feria</Button>
          </div>
        </Card>

        {/* ── Horse Section ── */}
        <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-gold/10 p-2 rounded-lg"><Target size={20} className="text-brand-gold" /></div>
            <h2 className="text-xl font-black text-brand-green uppercase">Registrar Caballo</h2>
          </div>
          <div className="space-y-4">
            <input className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" placeholder="Nombre del caballo" value={newHorse.name} onChange={e => setNewHorse({...newHorse, name: e.target.value})} />
            <input className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" placeholder="Criadero" value={newHorse.breed} onChange={e => setNewHorse({...newHorse, breed: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" value={newHorse.sexo} onChange={e => setNewHorse({...newHorse, sexo: e.target.value})}>
                <option value="MACHO">MACHO</option>
                <option value="HEMBRA">HEMBRA</option>
              </select>
              <input type="number" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" placeholder="Edad (meses)" value={newHorse.edadMeses} onChange={e => setNewHorse({...newHorse, edadMeses: e.target.value})} />
            </div>
            <Button className="w-full py-4 uppercase font-black tracking-widest text-xs" onClick={handleCreateHorse} disabled={saving || !newHorse.name}>Registrar Ejemplar</Button>
          </div>
        </Card>
      </div>

      {/* ── Assignments Section ── */}
      <div className="grid grid-cols-1 gap-8">
        <Card className="p-8 border-none shadow-lg">
          <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <Users className="text-brand-green" size={32} />
            <div>
              <h2 className="text-2xl font-black text-brand-green uppercase tracking-tight">Gestión de Competencias</h2>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Asignación por Feria y Modalidad</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Step 1: Feria & Category */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-brand-gold font-black text-xs uppercase tracking-widest mb-4">
                <span className="bg-brand-gold text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span>
                Activar Categoría
              </div>
              <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-brand-green" value={selectedFeriaId} onChange={e => setSelectedFeriaId(e.target.value)}>
                <option value="">Selecciona una feria</option>
                {ferias.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Categorías Maestras (Modalidad > Sexo > Edad)</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-600" value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}>
                  <option value="">Selecciona categoría oficial</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <Button variant="outline" className="w-full py-4 border-2" onClick={handleActivateCategory} disabled={saving || !selectedFeriaId || !selectedCategoryId}>
                Activar en Feria
              </Button>
            </div>

            {/* Step 2: Competition & Horse */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-brand-gold font-black text-xs uppercase tracking-widest mb-4">
                <span className="bg-brand-gold text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span>
                Asignar Participante
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Competencias Activas en {ferias.find(f => f.id === selectedFeriaId)?.name || '...'}</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-brand-green" value={selectedCompetitionId} onChange={e => setSelectedCompetitionId(e.target.value)}>
                  <option value="">Selecciona competencia activa</option>
                  {ferias.find(f => f.id === selectedFeriaId)?.competencias?.map(comp => (
                    <option key={comp.id} value={comp.id}>{comp.categoria.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Caballos Registrados</label>
                <select className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-600" value={selectedHorseId} onChange={e => setSelectedHorseId(e.target.value)}>
                  <option value="">Selecciona ejemplar</option>
                  {horses.map(h => <option key={h.id} value={h.id}>{h.nombre} ({h.sexo} • {h.edadMeses}m)</option>)}
                </select>
              </div>

              <Button className="w-full py-4 uppercase font-black tracking-widest text-xs" onClick={handleAssignHorse} disabled={saving || !selectedCompetitionId || !selectedHorseId}>
                Confirmar Participación
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

