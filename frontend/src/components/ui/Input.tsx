import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, style, id, ...props }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      <label
        htmlFor={inputId}
        style={{
          fontSize: 'var(--fs-sm)',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        style={{
          background: '#FFFFFF',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-medium)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 1rem',
          color: 'var(--text-primary)',
          fontSize: 'var(--fs-base)',
          outline: 'none',
          transition: 'var(--transition-fast)',
          width: '100%',
          fontFamily: 'var(--font-sans)',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--brand-green)';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.12)' : 'rgba(11,61,46,0.12)'}`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border-medium)';
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
        {...props}
      />
      {hint && !error && (
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)', fontWeight: '500' }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
};
