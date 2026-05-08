import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { ModalityDetail } from '../components/ui/ModalityDetail';
import type { ApiResponse, Feria } from '../types';
import {
  MapPin, Calendar, Trophy, Users, Search,
  SlidersHorizontal, Building2, ChevronDown
} from 'lucide-react';

// ─── Modality config ──────────────────────────────────────────────────────────
const MOD_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  'paso-fino':         { label: 'Paso Fino',        icon: '🐴', color: '#D4AF37' },
  'trocha':            { label: 'Trocha',            icon: '🏇', color: '#22C55E' },
  'trocha-y-galope':   { label: 'Trocha y Galope',  icon: '⚡', color: '#3B82F6' },
  'trote-y-galope':    { label: 'Trote y Galope',   icon: '🔥', color: '#A78BFA' },
  'asnales-y-mulares': { label: 'Asnales y Mulares',icon: '🦴', color: '#F97316' },
};
const DEFAULT_MOD = { label: '', icon: '🏇', color: '#D4AF37' };
const getModConfig = (slug: string, nombre: string) => {
  const c = MOD_CONFIG[slug] ?? DEFAULT_MOD;
  return { ...c, label: c.label || nombre };
};

// ─── Stat box ─────────────────────────────────────────────────────────────────
const StatBox: React.FC<{ icon: React.ReactNode; value: number; label: string }> = ({ icon, value, label }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '.9rem 1.4rem',
    background: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: 'var(--r-lg)',
    gap: '.2rem',
  }}>
    <span style={{ color: 'var(--brand-gold)', marginBottom: 2 }}>{icon}</span>
    <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--brand-gold)', lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
  </div>
);

// ─── Hero Banner for a feria ──────────────────────────────────────────────────
const FeriaHero: React.FC<{ feria: Feria; totalComps: number }> = ({ feria, totalComps }) => {
  const isLive = feria.status === 'activa';
  return (
    <div style={{
      position: 'relative', borderRadius: 'var(--r-2xl)', overflow: 'hidden',
      background: 'linear-gradient(135deg, #0B2318 0%, #1A4838 55%, #0B2318 100%)',
      border: '1px solid rgba(212,175,55,0.2)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      marginBottom: '1.5rem',
    }}>
      {/* Gold top line */}
      <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#D4AF37 30%,#F0D060 50%,#D4AF37 70%,transparent)' }} />

      {/* Radial glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(212,175,55,0.07) 0%, transparent 70%)',
      }} />

      <div style={{ padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', position: 'relative' }}>
        {/* Left */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.7rem' }}>
            {isLive ? <span className="badge-live">En Vivo</span> : null}
            <span style={{ fontSize: '.6rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              FERIA OFICIAL FEDEQUINAS
            </span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-brand)', fontWeight: 900,
            fontSize: 'clamp(1.3rem,2.5vw,1.9rem)', color: '#F2EFE8',
            lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '.85rem',
          }}>
            {feria.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
              <MapPin size={13} color="var(--brand-gold)" /> {feria.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: 'var(--text-secondary)', fontSize: '.8rem' }}>
              <Calendar size={13} color="var(--brand-gold)" />
              {new Date(feria.startDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })} — {new Date(feria.endDate).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <StatBox icon={<Trophy size={16} />} value={feria.modalidades?.length ?? 0} label="Modalidades" />
          <StatBox icon={<Users size={16} />} value={totalComps} label="Competencias activas" />
        </div>
      </div>
    </div>
  );
};


// ─── Feria Section ────────────────────────────────────────────────────────────
const FeriaSection: React.FC<{ feria: Feria; isFirst?: boolean }> = ({ feria, isFirst = false }) => {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  const totalComps = (feria.modalidades ?? []).reduce(
    (a, m) => a + (m.sexos ?? []).reduce((b, s) => b + (s.competencias?.length ?? 0), 0), 0
  );

  return (
    <section style={{ 
      background: 'rgba(255,255,255,0.02)', 
      padding: '1.5rem', 
      borderRadius: 'var(--r-2xl)',
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: '2rem'
    }}>
      {/* Feria Title Accordion */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          cursor: 'pointer',
          marginBottom: isExpanded ? '1.5rem' : 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: 42, height: 42, borderRadius: 'var(--r-lg)', 
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Building2 size={20} color="var(--brand-gold)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {feria.name}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{feria.location} • {totalComps} competencias</p>
          </div>
        </div>
        <div style={{ 
          width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
        }}>
          <ChevronDown size={18} color="var(--text-muted)" />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Hero */}
            <FeriaHero feria={feria} totalComps={totalComps} />

            {/* Modalidades section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '.04em' }}>🏆 Modalidades FEDEQUINAS</span>
            </div>

            {/* Modalities Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}>
              {(feria.modalidades ?? []).map(mod => {
                const cfg = getModConfig(mod.slug, mod.nombre);
                return (
                  <ModalityDetail
                    key={mod.id}
                    modality={mod}
                    accentColor={cfg.color}
                    icon={cfg.icon}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};


// ─── Main Home ────────────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const { user } = useAuth();
  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadFerias(); }, []);

  const loadFerias = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Feria[]>>('/events');
      if (res.data?.success) setFerias(res.data.data ?? []);
    } catch { /* show empty */ }
    finally { setLoading(false); }
  };

  const filtered = ferias.filter(f => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) ||
           f.location.toLowerCase().includes(q) ||
           (f.modalidades ?? []).some(m => m.nombre.toLowerCase().includes(q));
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <Spinner size={36} color="var(--brand-gold)" />
      <p style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '.85rem', color: 'var(--brand-gold)', letterSpacing: '.15em', textTransform: 'uppercase' }}>Cargando Ferias...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* ── Page title ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '.3rem' }}>
          Bienvenido{user?.firstName ? `, ${user.firstName}` : ''}
        </p>
        <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          Ferias &amp; <span className="gradient-gold-text">Competencias</span>
        </h1>
        <p style={{ fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: '.3rem' }}>
          Plataforma oficial · Fedequinas / Confepaso
        </p>
      </motion.div>

      {/* ── Search bar ── */}
      <div style={{
        display: 'flex', gap: '.65rem', marginBottom: '2rem', flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: '.55rem',
          background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--r-lg)', padding: '.65rem 1rem',
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar feria o ciudad..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '.85rem', fontFamily: 'var(--font-sans)',
            }}
          />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '.45rem',
          padding: '.65rem 1.1rem',
          background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--r-lg)', color: 'var(--text-secondary)',
          fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          transition: 'all .2s',
        }}>
          <SlidersHorizontal size={14} /> Filtros
        </button>
      </div>

      {/* ── Ferias ── */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          padding: '4rem 2rem', background: 'var(--bg-card)',
          border: '1px dashed rgba(212,175,55,0.15)', borderRadius: 'var(--r-2xl)',
        }}>
          <Building2 size={48} color="rgba(212,175,55,0.2)" strokeWidth={1.5} />
          <h3 style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Sin Ferias Activas</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', textAlign: 'center', maxWidth: 280 }}>
            No hay competencias disponibles. Vuelve pronto.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          {filtered.map((feria, idx) => (
            <FeriaSection key={feria.id} feria={feria} isFirst={idx === 0} />
          ))}
        </motion.div>
      )}
    </div>
  );
};
