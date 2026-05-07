import React from 'react';

interface StatPillProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: boolean;
}

export const StatPill: React.FC<StatPillProps> = ({ label, value, icon, accent }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.1rem',
    padding: '0.5rem 0.85rem',
    borderRadius: 'var(--radius-lg)',
    background: accent ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${accent ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}`,
    minWidth: 60,
  }}>
    {icon && (
      <span style={{ color: accent ? 'var(--brand-gold)' : 'var(--text-muted)', marginBottom: 2 }}>
        {icon}
      </span>
    )}
    <span style={{
      fontFamily: 'var(--font-brand)',
      fontSize: 'var(--fs-lg)',
      fontWeight: 800,
      color: accent ? 'var(--brand-gold)' : 'var(--text-primary)',
      lineHeight: 1,
    }}>
      {value}
    </span>
    <span style={{
      fontSize: '0.6rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
    }}>
      {label}
    </span>
  </div>
);
