import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, TrendingUp, ChevronRight, Lock } from 'lucide-react';
import type { Category } from '../../types';

interface AgeRangeRowProps {
  competencia: Category;
  index: number;
  accentColor: string;
}

export const AgeRangeRow: React.FC<AgeRangeRowProps> = ({ competencia, index, accentColor }) => {
  const navigate = useNavigate();
  const isClosed = competencia.status === 'cerrada';
  const isLive = competencia.status === 'en_vivo';
  const isClickable = !isClosed;

  const handleClick = () => {
    if (isClickable) navigate(`/events/${competencia.id}`);
  };

  const ageLabel = (competencia as any).ageRange?.nombre ?? competencia.nombre;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.8rem 1rem',
        borderRadius: 'var(--radius-lg)',
        background: isLive
          ? 'rgba(239,68,68,0.06)'
          : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isLive
          ? 'rgba(239,68,68,0.2)'
          : isClosed
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.06)'}`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.18s ease',
        opacity: isClosed ? 0.5 : 1,
        gap: '0.75rem',
      }}
      whileHover={isClickable ? {
        backgroundColor: `${accentColor}10`,
        borderColor: `${accentColor}30`,
        x: 2,
      } : {}}
    >
      {/* Left: indicator + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
        {/* Status indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: isLive ? '#EF4444' : isClosed ? 'var(--text-muted)' : `${accentColor}80`,
          boxShadow: isLive ? '0 0 8px rgba(239,68,68,0.6)' : 'none',
          animation: isLive ? 'livePulse 1.5s infinite' : 'none',
        }} />

        {/* Age range label */}
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {ageLabel}
          </p>
          {/* Sub-stats */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.67rem', fontWeight: 600 }}>
              <Users size={10} />
              {(competencia as any).horseCount ?? 0} participantes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.67rem', fontWeight: 600 }}>
              <TrendingUp size={10} />
              {(competencia as any).betCount ?? 0} apuestas
            </span>
          </div>
        </div>
      </div>

      {/* Right: status + arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        {isLive && <span className="badge-live">En Vivo</span>}
        {isClosed ? (
          <Lock size={14} color="var(--text-muted)" />
        ) : (
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ChevronRight size={14} color="var(--text-muted)" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
