import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SexNode } from '../../types';
import { AgeRangeRow } from './AgeRangeRow';

interface SexTabsProps {
  sexos: SexNode[];
  accentColor: string;
}

export const SexTabs: React.FC<SexTabsProps> = ({ sexos, accentColor }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!sexos || sexos.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>
        Sin categorías configuradas
      </p>
    );
  }

  const activeSexo = sexos[activeTab] ?? sexos[0];

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '1.1rem',
        padding: '0.25rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(255,255,255,0.06)',
        width: 'fit-content',
      }}>
        {sexos.map((sexo, idx) => {
          const isActive = idx === activeTab;
          const isMachos = sexo.nombre?.toLowerCase().includes('macho');
          return (
            <button
              key={sexo.id}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 'calc(var(--radius-lg) - 2px)',
                border: 'none',
                background: isActive ? (isMachos ? 'rgba(59,130,246,0.2)' : 'rgba(236,72,153,0.18)') : 'transparent',
                color: isActive ? (isMachos ? '#60A5FA' : '#F472B6') : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.03em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{isMachos ? '♂' : '♀'}</span>
              {sexo.nombre}
              <span style={{
                fontSize: '0.62rem',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.05rem 0.45rem',
                fontWeight: 800,
              }}>
                {sexo.competencias?.length ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeSexo.competencias && activeSexo.competencias.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeSexo.competencias.map((comp: any, idx: number) => (
                <AgeRangeRow
                  key={comp.id}
                  competencia={comp}
                  index={idx}
                  accentColor={accentColor}
                />
              ))}
            </div>
          ) : (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed rgba(255,255,255,0.07)',
            }}>
              Sin competencias en esta categoría
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
