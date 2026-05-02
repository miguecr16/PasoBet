import React, { useState } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, hoverable = false, style, ...props }) => {
  const [hovered, setHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
    boxShadow: hovered && hoverable ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
    transition: 'var(--transition-normal)',
    transform: hovered && hoverable ? 'translateY(-3px)' : 'translateY(0)',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
};
