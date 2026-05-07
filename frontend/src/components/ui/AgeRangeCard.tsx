import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Lock } from 'lucide-react';
import type { Category } from '../../types';

interface AgeRangeCardProps {
  competencia: Category;
  index: number;
  accentColor?: string;
}

export const AgeRangeCard: React.FC<AgeRangeCardProps> = ({ competencia, index, accentColor = '#D4AF37' }) => {
  const navigate = useNavigate();
  const isClosed = competencia.status === 'cerrada';
  const isLive   = competencia.status === 'en_vivo';
  const isActive = !isClosed;

  const ageLabel = (competencia as any).ageRange?.nombre ?? competencia.nombre;
  const horses   = (competencia as any).horseCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      onClick={() => isActive && navigate(`/events/${competencia.id}`)}
      style={{
        background: 'var(--bg-card-2)',
        border: `1px solid ${isLive ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '1rem',
        cursor: isActive ? 'pointer' : 'default',
        opacity: isClosed ? 0.5 : 1,
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
      whileHover={isActive ? {
        borderColor: `${accentColor}40`,
        background: 'var(--bg-card-hover)',
        y: -2,
      } as any : {}}
    >
      {/* Horse icon + age label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {/* Minimal horse silhouette */}
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--r-md)',
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', flexShrink: 0,
        }}>
          🐴
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '0.82rem', fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {ageLabel}
          </p>
          {isLive && <span className="badge-live" style={{ marginTop: 2 }}>En Vivo</span>}
          {isClosed && (
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Cerrada
            </span>
          )}
        </div>
      </div>

      {/* Participants */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 600,
      }}>
        <Users size={12} color="var(--text-muted)" />
        {horses} participantes
      </div>

      {/* CTA */}
      {isActive ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          color: 'var(--brand-gold)', fontSize: '0.72rem', fontWeight: 700,
          marginTop: 'auto',
        }}>
          Ver participantes <ArrowRight size={12} />
        </div>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600,
        }}>
          <Lock size={11} /> Cerrada
        </div>
      )}
    </motion.div>
  );
};
