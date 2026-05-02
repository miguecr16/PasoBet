import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { ProfileStats } from './pages/ProfileStats';
import { Spinner } from './components/ui/Spinner';
import api from './services/api';

import {
  Coins,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { Logo } from './components/Logo';

// ─── Icon size tokens ──────────────────────────────────────────────────────────
const ICON_SM = 16;

// ─── Protected Route Guard ────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: '0.75rem', color: 'var(--text-secondary)',
        fontSize: 'var(--fs-lg)',
      }}>
        <Spinner size={28} color="var(--brand-green)" />
        Cargando PasoBet...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, wallet, signOut, refreshWallet } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState('');

  const handleDeposit = async (amount: number) => {
    setDepositLoading(true);
    setDepositSuccess('');

    try {
      await api.post('/wallet/deposit', { amount });
      await refreshWallet();
      setDepositSuccess(`Saldo recargado: +$${amount.toLocaleString('es-CO')} COP`);
      setTimeout(() => setDepositSuccess(''), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al recargar saldo';
      setDepositSuccess(message);
    } finally {
      setDepositLoading(false);
    }
  };

  return (
    <nav style={{
      background: 'var(--brand-green)',
      borderBottom: '2px solid var(--brand-gold)',
      padding: '0 var(--space-5)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60,
        position: 'relative',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo size="medium" />
        </Link>

        {/* Right section */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', position: 'relative' }}>

            {/* Balance pill */}
            <div
              onClick={() => setMenuOpen((current) => !current)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--brand-gold)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.35rem 1rem',
                boxShadow: '0 2px 8px rgba(212,175,55,0.4)',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Coins size={14} color="var(--brand-green)" strokeWidth={2.5} />
              <span style={{
                color: 'var(--brand-green)',
                fontWeight: '800',
                fontSize: 'var(--fs-sm)',
                fontFamily: "'Outfit', var(--font-sans)",
                letterSpacing: '0.01em',
              }}>
                ${wallet ? wallet.balance.toLocaleString('es-CO') : '0'}
              </span>
            </div>

            {menuOpen && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 0.75rem)',
                width: 260,
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 24px 56px rgba(0,0,0,0.16)',
                padding: '1rem',
                zIndex: 200,
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Añadir saldo
                </p>
                <p style={{ margin: '0.35rem 0 0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Selecciona un monto para recargar tu cuenta.
                </p>
                <div style={{ display: 'grid', gap: '0.65rem' }}>
                  {[10000, 50000, 100000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleDeposit(amount)}
                      disabled={depositLoading}
                      style={{
                        width: '100%',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(17,24,39,0.08)',
                        background: depositLoading ? 'rgba(212,175,55,0.16)' : 'var(--brand-green)',
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        padding: '0.75rem',
                        cursor: depositLoading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      + ${amount.toLocaleString('es-CO')} COP
                    </button>
                  ))}
                </div>
                {depositSuccess && (
                  <p style={{ margin: '0.85rem 0 0', color: 'var(--brand-green)', fontSize: '0.84rem', fontWeight: 600 }}>
                    {depositSuccess}
                  </p>
                )}
              </div>
            )}

            {/* Admin badge */}
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                color: 'var(--brand-gold)',
                fontSize: 'var(--fs-xs)',
                fontWeight: '700',
                textDecoration: 'none',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.28)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.15)')}
              >
                <Shield size={13} />
                Admin
              </Link>
            )}

            {/* User name — dinámico desde sesión */}
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 'var(--fs-sm)',
              fontWeight: '600',
              textDecoration: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-pill)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <User size={15} color="rgba(255,255,255,0.55)" />
              {user.firstName}
            </Link>

            {/* Salir */}
            <button
              onClick={signOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.75)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.3rem 0.75rem',
                cursor: 'pointer',
                fontSize: 'var(--fs-xs)',
                fontWeight: '600',
                transition: 'var(--transition-fast)',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            >
              <LogOut size={ICON_SM} />
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── Routes ───────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      }
    />
    <Route
      path="/events/:id"
      element={
        <ProtectedRoute>
          <EventDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfileStats />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login: full-screen sin navbar */}
          <Route path="/login" element={<Login />} />

          {/* App shell: con navbar y footer */}
          <Route path="/*" element={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
              <Navbar />
              <main style={{ flex: 1, padding: 'var(--space-6) var(--space-5)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                  <AppRoutes />
                </div>
              </main>
              <footer style={{
                background: 'var(--brand-green)',
                borderTop: '1px solid rgba(212,175,55,0.2)',
                padding: 'var(--space-3) var(--space-5)',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 'var(--fs-xs)',
              }}>
                © 2026 PasoBet — Ferias Equinas Colombia
              </footer>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
