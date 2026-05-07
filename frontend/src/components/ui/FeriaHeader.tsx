import React from 'react';
import { MapPin, Calendar, Trophy, ChevronRight } from 'lucide-react';
import type { Feria } from '../../types';

interface FeriaHeaderProps {
  feria: Feria;
  totalCompetencias: number;
}

export const FeriaHeader: React.FC<FeriaHeaderProps> = ({ feria, totalCompetencias }) => {
  const startDate = new Date(feria.startDate).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const endDate = new Date(feria.endDate).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long'
  });

  const isActive = feria.status === 'activa';

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-2xl)',
      overflow: 'hidden',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, #0F2F24 0%, #1A4D38 50%, #0F2F24 100%)',
      border: '1px solid rgba(212,175,55,0.25)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.06)',
    }}>
      {/* Decorative pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 80% 50%, rgba(212,175,55,0.08) 0%, transparent 60%),
          radial-gradient(circle at 20% 80%, rgba(37,107,78,0.3) 0%, transparent 40%)`,
        pointerEvents: 'none',
      }} />

      {/* Gold top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #D4AF37 30%, #F0D060 50%, #D4AF37 70%, transparent 100%)',
      }} />

      <div style={{ position: 'relative', padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Left: Identity */}
        <div style={{ flex: 1, minWidth: 220 }}>
          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {isActive ? (
              <span className="badge-live">En Vivo</span>
            ) : (
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--text-muted)',
              }}>
                {feria.status}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              FERIA OFICIAL FEDEQUINAS
            </span>
          </div>

          {/* Name */}
          <h2 style={{
            fontFamily: 'var(--font-brand)',
            fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 900,
            color: '#F0EDE6',
            lineHeight: 1.1,
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            {feria.name}
          </h2>

          {/* Meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <MapPin size={13} color="var(--brand-gold)" />
              {feria.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <Calendar size={13} color="var(--brand-gold)" />
              {startDate} — {endDate}
            </span>
          </div>
        </div>

        {/* Right: Stats */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <Trophy size={16} color="var(--brand-gold)" strokeWidth={2} style={{ marginBottom: 4 }} />
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--brand-gold)', lineHeight: 1 }}>
              {feria.modalidades?.length ?? 0}
            </span>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
              Modalidades
            </span>
          </div>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0.75rem 1.25rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <ChevronRight size={16} color="var(--text-muted)" strokeWidth={2} style={{ marginBottom: 4 }} />
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {totalCompetencias}
            </span>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
              Competencias
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
