import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-dark) 100%)',
    color: 'var(--text-on-gold)',
    border: 'none',
    boxShadow: 'var(--shadow-gold)',
  },
  secondary: {
    background: 'var(--brand-green)',
    color: 'var(--text-on-dark)',
    border: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--brand-green)',
    border: '1.5px solid var(--border-medium)',
  },
  danger: {
    background: 'var(--danger)',
    color: '#fff',
    border: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: 'none',
  },
};

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { padding: '0.375rem 0.875rem', fontSize: 'var(--fs-sm)' },
  md: { padding: '0.625rem 1.375rem', fontSize: 'var(--fs-base)' },
  lg: { padding: '0.875rem 1.75rem', fontSize: 'var(--fs-lg)' },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  disabled,
  style,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontFamily: 'var(--font-sans)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.65 : 1,
    transition: 'var(--transition-fast)',
    whiteSpace: 'nowrap',
    ...SIZE_STYLES[size],
    ...VARIANT_STYLES[variant],
    ...style,
  };

  return (
    <button
      style={baseStyle}
      disabled={isDisabled}
      {...props}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.filter = '';
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        props.onMouseLeave?.(e);
      }}
    >
      {isLoading ? (
        <Spinner size={18} color={variant === 'primary' ? 'var(--brand-green)' : 'var(--brand-gold)'} />
      ) : (
        <>
          {leftIcon}
          {children}
        </>
      )}
    </button>
  );
};
