import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, Feria, Category } from '../types';
import {
  Zap,
  Repeat,
  MoveRight,
  MoveUp,
  Target,
  ChevronRight,
  Radio,
  AlertCircle,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

// ─── Modalidad Config ────────────────────────────────────────────────────────
const MODALIDADES_CONFIG: Record<string, { label: string; icon: any }> = {
  PASO_FINO: { label: 'Paso Fino', icon: Zap },
  TROCHA: { label: 'Trocha', icon: Repeat },
  TROCHA_GALOPE: { label: 'Trocha y Galope', icon: MoveRight },
  TROTE_GALOPE: { label: 'Trote y Galope', icon: MoveUp },
  ASNALES_MULARES: { label: 'Asnales y Mulares', icon: Target },
};

const STATUS_LABELS: Record<string, string> = {
  abierta: 'Abierta',
  en_vivo: 'En vivo',
  cerrada: 'Cerrada',
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation State
  const [selectedModality, setSelectedModality] = useState<string>('PASO_FINO');
  const [selectedSexo, setSelectedSexo] = useState<'MACHO' | 'HEMBRA'>('MACHO');

  useEffect(() => {
    loadFerias();
  }, []);

  const loadFerias = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<ApiResponse<Feria[]>>('/events');
      if (res.data?.success) {
        setFerias(res.data.data ?? []);
      } else {
        setError(res.data?.message ?? 'Error al cargar eventos');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-500">
        <Spinner size={40} color="var(--brand-green)" />
        <p className="text-lg font-medium">Sincronizando con Fedequinas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-green leading-tight">
          Panel de Competencias
        </h1>
        <p className="text-gray-500 mt-1">
          Estructura profesional Fedequinas • Bienvenida, {user?.firstName}
        </p>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-8 sticky top-4 z-10">
        {/* Modality Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide">
          {Object.entries(MODALIDADES_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const isSelected = selectedModality === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedModality(key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${
                  isSelected 
                    ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20 scale-105' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Icon size={18} strokeWidth={isSelected ? 2.5 : 2} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Sex Toggle */}
        <div className="flex bg-gray-50 p-1 rounded-xl w-fit mx-auto sm:mx-0">
          {(['MACHO', 'HEMBRA'] as const).map((sexo) => (
            <button
              key={sexo}
              onClick={() => setSelectedSexo(sexo)}
              className={`px-8 py-2 rounded-lg text-xs font-black transition-all ${
                selectedSexo === sexo
                  ? 'bg-white text-brand-green shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {sexo === 'MACHO' ? '♂ MACHOS' : '♀ HEMBRAS'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="space-y-12">
        {ferias.map((feria) => {
          // Filtrar competencias por modalidad y sexo seleccionados
          const filteredCompetencias = feria.categories.filter(
            c => c.modalidad === selectedModality && c.sexo === selectedSexo
          );

          if (filteredCompetencias.length === 0) return null;

          return (
            <section key={feria.id} className="relative">
              {/* Feria Info */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 px-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-brand-gold" />
                    <h2 className="text-xl font-black text-brand-green uppercase tracking-tight">
                      {feria.name}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={12} /> {feria.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(feria.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                  {filteredCompetencias.length} Eventos Activos
                </div>
              </div>

              {/* Competencias Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredCompetencias.sort((a, b) => a.edadMin - b.edadMin).map((comp) => {
                  const isLive = comp.status === 'en_vivo';
                  const isClosed = comp.status === 'cerrada';
                  
                  return (
                    <Card
                      key={comp.id}
                      hoverable={!isClosed}
                      onClick={() => !isClosed && navigate(`/events/${comp.id}`)}
                      className={`relative overflow-hidden group transition-all ${
                        isClosed ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:border-brand-gold'
                      }`}
                    >
                      {/* Status Badge */}
                      <div className="absolute top-0 right-0">
                        <div className={`px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-tighter ${
                          isLive ? 'bg-red-500 text-white animate-pulse' : 
                          isClosed ? 'bg-gray-200 text-gray-500' : 'bg-brand-green/10 text-brand-green'
                        }`}>
                          {isLive && <Radio size={10} className="inline mr-1 mb-0.5" />}
                          {STATUS_LABELS[comp.status]}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-6 pb-4 px-5">
                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">
                          Edad
                        </p>
                        <h3 className="text-2xl font-black text-brand-green mb-4">
                          {comp.edadMin === 100 ? '+100' : `${comp.edadMin}-${comp.edadMax}`}
                          <span className="text-xs font-medium text-gray-400 ml-1 tracking-normal">meses</span>
                        </h3>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-[8px] font-bold text-gray-400 uppercase">Horses</p>
                              <p className="text-sm font-black text-brand-green">{comp.horseCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[8px] font-bold text-gray-400 uppercase">Bets</p>
                              <p className="text-sm font-black text-brand-gold-dark">{comp.betCount}</p>
                            </div>
                          </div>
                          {!isClosed && (
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                              <ChevronRight size={18} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Decoration */}
                      <div className={`h-1 w-full ${isLive ? 'bg-red-500' : isClosed ? 'bg-gray-200' : 'bg-brand-green'}`} />
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {ferias.every(f => f.categories.filter(c => c.modalidad === selectedModality && c.sexo === selectedSexo).length === 0) && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold">No hay competencias activas para esta selección.</p>
          <Button variant="outline" className="mt-4" onClick={loadFerias}>Refrescar Sistema</Button>
        </div>
      )}
    </div>
  );
};


