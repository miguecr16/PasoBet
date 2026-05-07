import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Users, BarChart2 } from 'lucide-react';
import type { ModalityNode } from '../../types';
import { SexTabs } from './SexTabs';

interface ModalityCardProps {
  modality: ModalityNode;
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
}

export const ModalityCard: React.FC<ModalityCardProps> = ({
  modality, icon, color, defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalCompetencias = modality.sexos?.reduce(
    (acc, s) => acc + (s.competencias?.length ?? 0), 0
  ) ?? 0;

  const totalParticipantes = modality.sexos?.reduce(
    (acc, s) => acc + s.competencias?.reduce(
      (a, c) => a + ((c as any).horseCount ?? 0), 0
    ), 0
  ) ?? 0;

  return (
    <motion.div
      layout
      style={{
        borderRadius: 'var(--radius-xl)',
        border: `1px solid ${isOpen ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}`,
        background: isOpen ? 'var(--bg-card)' : 'var(--bg-surface)',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, background 0.25s ease',
        boxShadow: isOpen ? 'var(--shadow-md)' : 'none',
      }}
    >
      {/* ── Header button ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.4rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          gap: '1rem',
          textAlign: 'left',
        }}
      >
        {/* Icon + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1 }}>
          <div style={{
            width: 42, height: 42,
            borderRadius: 'var(--radius-lg)',
            background: `${color}20`,
            border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-brand)',
              fontSize: '1rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}>
              {modality.nombre}
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 2 }}>
              {modality.sexos?.length ?? 0} categorías de sexo
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {totalCompetencias > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <BarChart2 size={13} />
                <span style={{ fontWeight: 700 }}>{totalCompetencias}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <Users size={13} />
                <span style={{ fontWeight: 700 }}>{totalParticipantes}</span>
              </div>
            </>
          )}
          <div style={{
            width: 30, height: 30,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}>
            <ChevronDown size={15} color="var(--text-muted)" />
          </div>
        </div>
      </button>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              padding: '1.25rem 1.4rem 1.4rem',
            }}>
              <SexTabs sexos={modality.sexos ?? []} accentColor={color} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
