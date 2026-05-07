import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import type { ModalityNode } from '../../types';
import { AgeRangeCard } from './AgeRangeCard';

interface ModalityDetailProps {
  modality: ModalityNode;
  accentColor: string;
  icon: string; // emoji icon
}

export const ModalityDetail: React.FC<ModalityDetailProps> = ({ modality, accentColor, icon }) => {
  const totalComps = modality.sexos?.reduce((a, s) => a + (s.competencias?.length ?? 0), 0) ?? 0;
  const totalParticipants = modality.sexos?.reduce(
    (a, s) => a + (s.competencias?.reduce((b, c) => b + ((c as any).horseCount ?? 0), 0) ?? 0), 0
  ) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        marginTop: '0.5rem',
      }}
    >
      {/* Detail header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.4rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--r-md)',
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>{icon}</div>
          <span style={{
            fontFamily: 'var(--font-brand)', fontWeight: 800,
            fontSize: '1.05rem', color: 'var(--text-primary)',
          }}>
            {modality.nombre}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--brand-gold)' }}>
              <Trophy size={13} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1rem' }}>{totalComps}</span>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Competencias</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
              <Users size={13} />
              <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 800, fontSize: '1rem' }}>{totalParticipants}</span>
            </div>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Participantes</p>
          </div>
        </div>
      </div>

      {/* Both sexes visible simultaneously */}
      <div style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {(modality.sexos ?? []).map((sexo) => {
          const isMachos = sexo.nombre?.toLowerCase().includes('macho');
          const sexColor = isMachos ? '#60A5FA' : '#F472B6';
          const sexBg    = isMachos ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)';
          const sexBorder= isMachos ? 'rgba(59,130,246,0.25)' : 'rgba(236,72,153,0.25)';

          return (
            <div key={sexo.id}>
              {/* Sex header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                marginBottom: '0.85rem',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.3rem 0.8rem',
                  background: sexBg,
                  border: `1px solid ${sexBorder}`,
                  borderRadius: 'var(--r-pill)',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{isMachos ? '♂' : '♀'}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: sexColor, letterSpacing: '0.03em' }}>
                    {sexo.nombre}
                  </span>
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* Age range cards grid */}
              {sexo.competencias && sexo.competencias.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '0.65rem',
                }}>
                  {(sexo.competencias as any[])
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
                <div style={{
                  padding: '1rem', textAlign: 'center',
                  color: 'var(--text-muted)', fontSize: '0.78rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 'var(--r-lg)',
                  border: '1px dashed rgba(255,255,255,0.06)',
                }}>
                  Sin competencias activas
                </div>
              )}
            </div>
          );
        })}

        {/* Empty fallback */}
        {(!modality.sexos || modality.sexos.length === 0) && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '1rem 0' }}>
            Sin categorías configuradas
          </p>
        )}
      </div>
    </motion.div>
  );
};
