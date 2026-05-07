import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, Feria } from '../types';
import {
  Zap,
  Repeat,
  MoveRight,
  MoveUp,
  Target,
  ChevronRight,
  Radio,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Users,
  Coins,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MODALIDADES_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  'paso-fino': { label: 'Paso Fino', icon: Zap, color: 'bg-blue-500' },
  'trocha': { label: 'Trocha', icon: Repeat, color: 'bg-emerald-500' },
  'trocha-y-galope': { label: 'Trocha y Galope', icon: MoveRight, color: 'bg-amber-500' },
  'trote-y-galope': { label: 'Trote y Galope', icon: MoveUp, color: 'bg-purple-500' },
  'asnales-y-mulares': { label: 'Asnales y Mulares', icon: Target, color: 'bg-rose-500' },
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedMods, setExpandedMods] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadFerias();
  }, []);

  const loadFerias = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Feria[]>>('/events');
      if (res.data?.success) {
        setFerias(res.data.data ?? []);
        // Expandir por defecto la primera modalidad de la primera feria
        if (res.data.data?.[0]?.modalidades?.[0]) {
          const firstId = `${res.data.data[0].id}-${res.data.data[0].modalidades[0].id}`;
          setExpandedMods({ [firstId]: true });
        }
      }
    } catch (err: any) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleMod = (feriaId: string, modId: string) => {
    const key = `${feriaId}-${modId}`;
    setExpandedMods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-brand-green/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size={40} color="var(--brand-green)" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-brand-green uppercase tracking-widest">Sincronizando</h2>
          <p className="text-gray-400 text-sm font-medium">Arquitectura Profesional Fedequinas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-green p-2 rounded-lg shadow-lg shadow-brand-green/20">
            <Layers className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-black text-brand-green uppercase tracking-tighter">
            Estructura de Competencias
          </h1>
        </div>
        <p className="text-gray-400 font-bold ml-12">
          Bienvenido, <span className="text-brand-gold">{user?.firstName}</span> • Panel Jerárquico Oficial
        </p>
      </header>

      {/* ── Ferias Loop ─────────────────────────────────────────────────────── */}
      <div className="space-y-16">
        {ferias.map((feria) => (
          <section key={feria.id} className="relative">
            {/* Feria Identity */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-l-4 border-brand-gold pl-6 py-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Building2 size={18} className="text-brand-gold" />
                  <h2 className="text-2xl font-black text-brand-green uppercase tracking-tight">{feria.name}</h2>
                </div>
                <div className="flex flex-wrap gap-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-300" /> {feria.location}</span>
                  <span className="flex items-center gap-2"><Calendar size={14} className="text-gray-300" /> {new Date(feria.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Modalidades</p>
                  <p className="text-lg font-black text-brand-green">{feria.modalidades.length}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-center font-black uppercase text-[10px] tracking-widest ${
                  feria.status === 'activa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                }`}>
                  Feria {feria.status}
                </div>
              </div>
            </div>

            {/* Modalidades Hierarchy (The Core Change) */}
            <div className="space-y-6">
              {(feria.modalidades || []).map((mod) => {
                const config = MODALIDADES_CONFIG[mod.slug] || { label: mod.nombre, icon: Zap, color: 'bg-gray-500' };
                const Icon = config.icon;
                const isExpanded = expandedMods[`${feria.id}-${mod.id}`];

                return (
                  <div key={mod.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-500">
                    {/* Level 1: Modalidad Header */}
                    <button 
                      onClick={() => toggleMod(feria.id, mod.id)}
                      className="w-full flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${config.color} p-3 rounded-2xl shadow-lg shadow-black/5`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-black text-brand-green uppercase tracking-tight">{config.label}</h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{(mod.sexos || []).length} Categorías de Sexo</p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} className="text-gray-400" />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-6 pt-0 border-t border-gray-50 animate-slideDown">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                          {(mod.sexos || []).map((sexo: any) => (
                            <div key={sexo.id} className="relative">
                              {/* Level 2: Sex Header */}
                              <div className="flex items-center gap-3 mb-6">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sexo.nombre?.includes('Machos') ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                  <span className="font-black text-sm">{sexo.nombre?.includes('Machos') ? '♂' : '♀'}</span>
                                </div>
                                <h4 className="text-sm font-black text-brand-green uppercase tracking-widest">{sexo.nombre}</h4>
                                <div className="flex-1 h-[1px] bg-gray-100" />
                              </div>

                              {/* Level 3: Age Ranges / Competencies */}
                              <div className="space-y-3">
                                {(sexo.competencias || []).map((comp: any) => (
                                  <div 
                                    key={comp.id}
                                    onClick={() => comp.status !== 'cerrada' && navigate(`/events/${comp.id}`)}
                                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                                      comp.status === 'en_vivo' 
                                        ? 'bg-red-50/30 border-red-100 hover:bg-red-50 hover:border-red-200' 
                                        : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-brand-gold hover:shadow-xl hover:shadow-brand-gold/5'
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`w-2 h-2 rounded-full ${comp.status === 'en_vivo' ? 'bg-red-500 animate-pulse' : 'bg-brand-green/30'}`} />
                                      <div>
                                        <p className="text-xs font-black text-brand-green uppercase tracking-tight">{comp.ageRange.nombre}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase"><Users size={10} /> {comp.horseCount} Participantes</span>
                                          <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase"><Coins size={10} /> {comp.betCount} Apuestas</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      {comp.status === 'en_vivo' && (
                                        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">En Vivo</span>
                                      )}
                                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white group-hover:border-brand-gold transition-all">
                                        <ChevronRight size={16} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {ferias.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
          <Building2 className="mx-auto text-gray-200 mb-6" size={64} />
          <h3 className="text-xl font-black text-brand-green uppercase">Sin Ferias Activas</h3>
          <p className="text-gray-400 mt-2 font-medium">Sincroniza con el sistema central para cargar eventos.</p>
        </div>
      )}
    </div>
  );
};
