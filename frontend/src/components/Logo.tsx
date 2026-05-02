import React from 'react';

// ─── Tipos ───────────────────────────────────────────────────────────────────
type LogoSize    = 'small' | 'medium' | 'large' | 'xlarge';
type LogoVariant = 'dark' | 'light';   // dark = sobre fondo verde, light = sobre fondo claro

interface LogoConfig {
  imgSize:     number;
  fontSize:    string;
  subFontSize: string;
  gap:         string;
}

const SIZE_MAP: Record<LogoSize, LogoConfig> = {
  small:  { imgSize: 32,  fontSize: 'var(--fs-base)', subFontSize: '0.6rem',            gap: '0.4rem'  },
  medium: { imgSize: 44,  fontSize: 'var(--fs-xl)',   subFontSize: 'var(--fs-xs)',       gap: '0.5rem'  },
  large:  { imgSize: 64,  fontSize: 'var(--fs-2xl)',  subFontSize: 'var(--fs-xs)',       gap: '0.7rem'  },
  xlarge: { imgSize: 100, fontSize: 'var(--fs-3xl)',  subFontSize: 'var(--fs-sm)',       gap: '0.9rem'  },
};

interface LogoProps {
  size?:      LogoSize;
  variant?:   LogoVariant;
  /** Mostrar solo el isotipo (imagen) sin texto */
  iconOnly?:  boolean;
  /** Mostrar el eslogan "Apuesta · Confía · Gana" */
  showSlogan?: boolean;
  style?:     React.CSSProperties;
}

/**
 * Componente Logo oficial de PasoBet.
 * variant="dark"  → para navbars/fondos verdes (texto dorado + blanco)
 * variant="light" → para dashboards/fondos claros (texto verde oscuro)
 */
export const Logo: React.FC<LogoProps> = ({
  size      = 'medium',
  variant   = 'dark',
  iconOnly  = false,
  showSlogan = false,
  style,
}) => {
  const cfg = SIZE_MAP[size];

  const wordmarkColor = variant === 'dark' ? 'var(--brand-gold)'  : 'var(--brand-green)';
  const betColor      = variant === 'dark' ? '#FFFFFF'            : 'var(--brand-green-mid)';
  const sloganColor   = variant === 'dark' ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: cfg.gap,
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* Isotipo — imagen oficial de marca */}
      <img
        src="/logo-icon.png"
        alt="PasoBet"
        style={{
          width:        cfg.imgSize,
          height:       cfg.imgSize,
          flexShrink:   0,
          objectFit:    'contain',
          display:      'block',
          // Optional: slight drop shadow to make the golden icon pop
          filter:       variant === 'dark' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}
      />

      {/* Wordmark */}
      {!iconOnly && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily:    "'Outfit', var(--font-sans)",
              fontWeight:    800,
              fontSize:      cfg.fontSize,
              color:         wordmarkColor,
              letterSpacing: '-0.02em',
              whiteSpace:    'nowrap',
            }}
          >
            Paso<span style={{ color: betColor }}>Bet</span>
          </span>

          {showSlogan && (
            <span
              style={{
                fontFamily:    "'Outfit', var(--font-sans)",
                fontWeight:    500,
                fontSize:      cfg.subFontSize,
                color:         sloganColor,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginTop:     '0.2rem',
              }}
            >
              Apuesta · Confía · Gana
            </span>
          )}
        </div>
      )}
    </div>
  );
};
