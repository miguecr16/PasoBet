import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { FeriaHeader } from '../components/ui/FeriaHeader';
import { ModalityCard } from '../components/ui/ModalityCard';
import type { ApiResponse, Feria } from '../types';
import {
  Zap, RefreshCw, ArrowLeftRight, ArrowUp, Target,
  Building2, Search, SlidersHorizontal,
} from 'lucide-react';

// ─── Modality visual config ────────────────────────────────────────────────────
const MODALITY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'paso-fino':        { icon: <Zap size={20} />,           color: '#D4AF37', label: 'Paso Fino' },
  'trocha':           { icon: <RefreshCw size={20} />,      color: '#22C55E', label: 'Trocha' },
  'trocha-y-galope':  { icon: <ArrowLeftRight size={20} />, color: '#3B82F6', label: 'Trocha y Galope' },
  'trote-y-galope':   { icon: <ArrowUp size={20} />,        color: '#A78BFA', label: 'Trote y Galope' },
  'asnales-y-mulares':{ icon: <Target size={20} />,         color: '#F97316', label: 'Asnales y Mulares' },
};

const DEFAULT_MODALITY = { icon: <Zap size={20} />, color: '#D4AF37', label: '' };

// ─── Stagger variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '5rem 2rem', gap: '1rem',
      background: 'var(--bg-card)',
      border: '1px dashed rgba(212,175,55,0.15)',
      borderRadius: 'var(--radius-2xl)',
    }}
  >
    <Building2 size={52} color="rgba(212,175,55,0.2)" strokeWidth={1.5} />
    <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      Sin Ferias Activas
    </h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: 320 }}>
      No hay competencias disponibles en este momento. Vuelve pronto.
    </p>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const Home: React.FC = () => {
  const { user } = useAuth();
  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);

  useEffect(() => { loadFerias(); }, []);

  const loadFerias = async () => {
    try {
      setLoading(true);
      const res = await api.get<ApiResponse<Feria[]>>('/events');
      if (res.data?.success) setFerias(res.data.data ?? []);
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  };

  // Filter ferias by search
  const filteredFerias = ferias.filter(f => {
    if (!searchQuery) return true;
    return f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           f.location.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ── Loading ──
  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: '1.25rem',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '2px solid rgba(212,175,55,0.1)',
            position: 'absolute', inset: 0, margin: 'auto',
            animation: 'pulse 2s infinite',
          }} />
          <Spinner size={40} color="var(--brand-gold)" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-brand)', fontSize: '1rem', fontWeight: 800, color: 'var(--brand-gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Cargando Ferias
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Sincronizando con Fedequinas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh' }}>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: '2.5rem' }}
      >
        {/* Greeting */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
            Bienvenido de nuevo
          </p>
          <h1 style={{
            fontFamily: 'var(--font-brand)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            {user?.firstName ? (
              <>{user.firstName} <span className="gradient-gold-text">PasoBet</span></>
            ) : (
              <><span className="gradient-gold-text">PasoBet</span> Colombia</>
            )}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Plataforma oficial de apuestas en ferias ecuestres · Fedequinas
          </p>
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 200,
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.6rem 1rem',
          }}>
            <Search size={15} color="var(--text-muted)" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar feria o ciudad..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
          <button
            onClick={() => setFilterActive(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: filterActive ? 'rgba(212,175,55,0.15)' : 'var(--bg-card)',
              border: `1px solid ${filterActive ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 'var(--radius-lg)',
              color: filterActive ? 'var(--brand-gold)' : 'var(--text-muted)',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease',
            }}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
        </div>
      </motion.div>

      {/* ── Ferias ───────────────────────────────────────────────────────── */}
      {filteredFerias.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}
        >
          {filteredFerias.map((feria, feriaIdx) => {
            const totalComps = (feria.modalidades ?? []).reduce(
              (acc, m) => acc + (m.sexos ?? []).reduce(
                (a, s) => a + (s.competencias?.length ?? 0), 0
              ), 0
            );

            return (
              <motion.section
                key={feria.id}
                variants={itemVariants}
              >
                {/* Feria header */}
                <FeriaHeader feria={feria} totalCompetencias={totalComps} />

                {/* Modality grid */}
                {(feria.modalidades ?? []).length === 0 ? (
                  <div style={{
                    padding: '2rem', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '0.8rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px dashed rgba(255,255,255,0.06)',
                  }}>
                    No hay modalidades configuradas para esta feria.
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                  >
                    {(feria.modalidades ?? []).map((mod, modIdx) => {
                      const cfg = MODALITY_CONFIG[mod.slug] ?? { ...DEFAULT_MODALITY, label: mod.nombre };
                      return (
                        <motion.div key={mod.id} variants={itemVariants}>
                          <ModalityCard
                            modality={mod}
                            icon={cfg.icon}
                            color={cfg.color}
                            defaultOpen={feriaIdx === 0 && modIdx === 0}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </motion.section>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
