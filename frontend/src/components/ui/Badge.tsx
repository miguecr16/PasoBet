import React from 'react';


interface BadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string; label: string; showDot: boolean }> = {
  // ── Estados del backend (español) ─────────────────────────────────────────
  abierta: {
    bg: 'rgba(3, 105, 161, 0.10)',
    color: '#0369A1',
    dot: '#0369A1',
    label: 'Abierta',
    showDot: false,
  },
  en_curso: {
    bg: 'rgba(220, 38, 38, 0.10)',
    color: '#DC2626',
    dot: '#DC2626',
    label: 'EN VIVO',
    showDot: true,
  },
  cerrada: {
    bg: 'rgba(22, 163, 74, 0.10)',
    color: '#16A34A',
    dot: '#16A34A',
    label: 'Cerrada',
    showDot: false,
  },
  // ── Alias en inglés (por compatibilidad) ──────────────────────────────────
  UPCOMING: {
    bg: 'rgba(3, 105, 161, 0.10)',
    color: '#0369A1',
    dot: '#0369A1',
    label: 'Próximo',
    showDot: false,
  },
  LIVE: {
    bg: 'rgba(220, 38, 38, 0.10)',
    color: '#DC2626',
    dot: '#DC2626',
    label: 'EN VIVO',
    showDot: true,
  },
  FINISHED: {
    bg: 'rgba(22, 163, 74, 0.10)',
    color: '#16A34A',
    dot: '#16A34A',
    label: 'Finalizado',
    showDot: false,
  },
  CANCELLED: {
    bg: 'rgba(107, 114, 128, 0.10)',
    color: '#6B7280',
    dot: '#6B7280',
    label: 'Cancelado',
    showDot: false,
  },
};

const DEFAULT_CONFIG = STATUS_CONFIG['abierta'];

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        background: cfg.bg,
        color: cfg.color,
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--fs-xs)',
        fontWeight: '700',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.showDot && (
        <span
          style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      )}
      {cfg.label}
    </span>
  );
};
