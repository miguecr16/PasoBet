import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { EventDetail } from './pages/EventDetail';
import { ProfileStats } from './pages/ProfileStats';
import { Admin } from './pages/Admin';
import { Spinner } from './components/ui/Spinner';
import { Logo } from './components/Logo';
import api from './services/api';
import {
  Coins, LogOut, User, Shield, ChevronDown, Plus,
} from 'lucide-react';

// ─── Loading screen ───────────────────────────────────────────────────────────
const LoadingScreen: React.FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', flexDirection: 'column', gap: '1rem',
    background: 'var(--bg-page)',
  }}>
    <Spinner size={32} color="var(--brand-gold)" />
    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      Cargando PasoBet...
    </p>
  </div>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// ─── Deposit Menu ─────────────────────────────────────────────────────────────
const DepositMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { refreshWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleDeposit = async (amount: number) => {
    setLoading(true);
    try {
      await api.post('/wallet/deposit', { amount });
      await refreshWallet();
      setSuccess(`+$${amount.toLocaleString('es-CO')} COP añadidos`);
      setTimeout(() => { setSuccess(''); onClose(); }, 2000);
    } catch {
      setSuccess('Error al recargar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
        width: 260, zIndex: 300,
        background: '#0D1A11',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '1rem 1.1rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-brand)' }}>
          Recargar Saldo
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Selecciona el monto a añadir
        </p>
      </div>

      {/* Amounts */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {[10000, 50000, 100000, 500000].map(amount => (
          <button
            key={amount}
            onClick={() => handleDeposit(amount)}
            disabled={loading}
            style={{
              width: '100%', padding: '0.65rem',
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.15)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--brand-gold)',
              fontWeight: 800, fontSize: '0.82rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: 'var(--font-brand)',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.18)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.35)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.15)';
            }}
          >
            <Plus size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            ${amount.toLocaleString('es-CO')} COP
          </button>
        ))}
      </div>

      {success && (
        <div style={{
          margin: '0 0.75rem 0.75rem',
          padding: '0.6rem',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 'var(--radius-md)',
          color: '#4ADE80',
          fontSize: '0.75rem', fontWeight: 700, textAlign: 'center',
        }}>
          {success}
        </div>
      )}
    </motion.div>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
  const { user, wallet, signOut } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8, 15, 11, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(212,175,55,0.12)',
      boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
    }}>
      {/* Gold top line */}
      <div style={{
        height: 2, width: '100%',
        background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.6) 30%, rgba(240,208,96,0.8) 50%, rgba(212,175,55,0.6) 70%, transparent 100%)',
      }} />

      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 58, padding: '0 1.25rem',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <Logo size="medium" />
        </Link>

        {/* Right section */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>

            {/* Balance pill */}
            <div
              onClick={() => setDepositOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.35rem 0.9rem 0.35rem 0.6rem',
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none',
                position: 'relative',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.2)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.12)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.3)';
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'rgba(212,175,55,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Coins size={12} color="var(--brand-gold)" strokeWidth={2.5} />
              </div>
              <span style={{
                fontFamily: 'var(--font-brand)',
                fontSize: '0.85rem', fontWeight: 800,
                color: 'var(--brand-gold)',
                letterSpacing: '0.01em',
              }}>
                ${wallet ? wallet.balance.toLocaleString('es-CO') : '0'}
              </span>
              <ChevronDown
                size={13}
                color="rgba(212,175,55,0.6)"
                style={{ transition: 'transform 0.2s', transform: depositOpen ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </div>

            <AnimatePresence>
              {depositOpen && <DepositMenu onClose={() => setDepositOpen(false)} />}
            </AnimatePresence>

            {/* Admin badge */}
            {user.role === 'ADMIN' && (
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                color: 'var(--brand-gold)', fontSize: '0.7rem', fontWeight: 700,
                textDecoration: 'none',
                padding: '0.3rem 0.7rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.2)',
                transition: 'all 0.15s',
              }}>
                <Shield size={12} />
                Admin
              </Link>
            )}

            {/* User */}
            <Link to="/profile" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600,
              textDecoration: 'none',
              padding: '0.3rem 0.7rem',
              borderRadius: 'var(--radius-pill)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={13} color="var(--brand-gold)" />
              </div>
              {user.firstName}
            </Link>

            {/* Logout */}
            <button
              onClick={signOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.3rem 0.7rem',
                cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 600,
                transition: 'all 0.15s',
                fontFamily: 'var(--font-sans)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)';
                (e.currentTarget as HTMLElement).style.color = '#F87171';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── Page transition wrapper ──────────────────────────────────────────────────
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

// ─── Routes ───────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/" element={<ProtectedRoute><PageTransition><Home /></PageTransition></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><PageTransition><EventDetail /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><ProfileStats /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageTransition><Admin /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

// ─── App Shell ────────────────────────────────────────────────────────────────
const AppShell: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-page)' }}>
    <Navbar />
    <main style={{ flex: 1, padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <AppRoutes />
      </div>
    </main>
    <footer style={{
      background: 'var(--bg-surface)',
      borderTop: '1px solid rgba(212,175,55,0.08)',
      padding: '1rem 1.25rem',
      textAlign: 'center',
    }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.06em' }}>
        © 2026 <span style={{ color: 'var(--brand-gold)' }}>PasoBet</span> — Ferias Ecuestres Colombia · Fedequinas · Confepaso
      </p>
    </footer>
  </div>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppShell />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
