import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import type { ModalityNode } from '../../types';
import { AgeRangeCard } from './AgeRangeCard';

interface ModalityDetailProps {
  modality: ModalityNode;
  accentColor: string;
  icon: string;
}

export const ModalityDetail: React.FC<ModalityDetailProps> = ({ modality, accentColor, icon }) => {
  const sexos = modality.sexos ?? [];
  const [activeSexId, setActiveSexId] = useState<string | null>(sexos[0]?.id ?? null);

  const totalComps = sexos.reduce((a, s) => a + (s.competencias?.length ?? 0), 0);
  const totalParticipants = sexos.reduce(
    (a, s) => a + (s.competencias?.reduce((b, c) => b + ((c as any).horseCount ?? 0), 0) ?? 0), 0
  );

  const activeSex = sexos.find(s => s.id === activeSexId) ?? sexos[0];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-mid)',
      borderRadius: 'var(--r-2xl)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-lg)',
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
          }}>{icon}</div>
          <div>
            <span style={{
              fontFamily: 'var(--font-brand)', fontWeight: 900,
              fontSize: '1.2rem', color: 'var(--text-primary)',
            }}>
              {modality.nombre}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-gold)', justifyContent: 'center' }}>
              <Trophy size={14} strokeWidth={2.5} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: '1.1rem' }}>{totalComps}</span>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Competencias</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', justifyContent: 'center' }}>
              <Users size={14} strokeWidth={2.5} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontSize: '1.1rem' }}>{totalParticipants}</span>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Participantes</p>
          </div>
        </div>
      </div>

      {/* Body: Tabs + Grid */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Tabs */}
        {sexos.length > 0 && (
          <div style={{
            display: 'flex', gap: '0.5rem', marginBottom: '1.25rem',
            background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: 'var(--r-xl)',
          }}>
            {sexos.map(sexo => {
              const isActive = sexo.id === activeSexId;
              const isMachos = sexo.nombre?.toLowerCase().includes('macho');
              const activeColor = isMachos ? '#60A5FA' : '#F472B6';
              const activeBg = isMachos ? 'rgba(59,130,246,0.15)' : 'rgba(236,72,153,0.15)';
              
              return (
                <button
                  key={sexo.id}
                  onClick={() => setActiveSexId(sexo.id)}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: 'var(--r-lg)',
                    background: isActive ? activeBg : 'transparent',
                    color: isActive ? activeColor : 'var(--text-muted)',
                    border: `1px solid ${isActive ? (isMachos ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)') : 'transparent'}`,
                    fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{isMachos ? '♂' : '♀'}</span>
                  {sexo.nombre}
                </button>
              );
            })}
          </div>
        )}

        {/* Age Grid */}
        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {activeSex ? (
              <motion.div
                key={activeSex.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {activeSex.competencias && activeSex.competencias.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.75rem',
                  }}>
                    {(activeSex.competencias as any[])
                      .sort((a, b) => (a.ageRange?.min ?? 0) - (b.ageRange?.min ?? 0))
                      .map((comp, idx) => (
                        <AgeRangeCard
                          key={comp.id}
                          competencia={comp}
                          index={idx}
                          accentColor={accentColor}
                        />
                      ))
                    }
                  </div>
                ) : (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--r-lg)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                    Sin competencias activas
                  </div>
                )}
              </motion.div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '2rem 0' }}>
                Sin categorías configuradas
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
