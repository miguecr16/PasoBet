import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/Logo';
import { AlertTriangle, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

const ICON_SM = 16;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signIn({ email: form.email, password: form.password });
      } else {
        await signUp(form);
      }
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm({ email: '', password: '', firstName: '', lastName: '', phone: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-page)',
    }}>
      {/* ── Panel izquierdo: identidad visual ──────────────────────────── */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--brand-green)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        // Mobile: oculto
        minWidth: 0,
      }}
      className="login-hero"
      >
        {/* Círculo decorativo de fondo */}
        <div style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.12)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: 350,
          height: 350,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.08)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        {/* Logo grande */}
        <Logo size="xlarge" showSlogan style={{ zIndex: 1 }} />

        {/* Tagline adicional */}
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 'var(--fs-xs)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: '3rem',
          textAlign: 'center',
          zIndex: 1,
        }}>
          Plataforma oficial de apuestas hípicas
        </p>
      </div>

      {/* ── Panel derecho: formulario ──────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#FAFAF8',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          animation: 'fadeIn 0.35s ease forwards',
        }}>
          {/* Header móvil (solo visible si el panel izquierdo está oculto) */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}
            className="login-mobile-header"
          >
            <Logo size="large" variant="light" showSlogan />
          </div>

          {/* Título del formulario */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 style={{
              fontSize: 'var(--fs-2xl)',
              fontWeight: '800',
              color: 'var(--brand-green)',
              fontFamily: "'Outfit', var(--font-sans)",
              marginBottom: '0.25rem',
            }}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
              {isLogin ? 'Accede a tu cuenta para continuar' : 'Únete a PasoBet hoy mismo'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(220,38,38,0.07)',
              border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-4)',
              color: 'var(--danger)',
              fontSize: 'var(--fs-sm)',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <AlertTriangle size={ICON_SM} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {!isLogin && (
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Input id="firstName" label="Nombre" required placeholder="Carlos"
                  value={form.firstName} onChange={updateField('firstName')} />
                <Input id="lastName" label="Apellido" required placeholder="López"
                  value={form.lastName} onChange={updateField('lastName')} />
              </div>
            )}

            <Input
              id="email" label="Usuario o correo" type="email" required
              placeholder="Ingresa tu usuario o correo"
              value={form.email} onChange={updateField('email')} autoComplete="email"
            />

            <div style={{ position: 'relative' }}>
              <Input
                id="password" label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                required placeholder="Ingresa tu contraseña"
                value={form.password} onChange={updateField('password')}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                hint={!isLogin ? 'Mínimo 8 caracteres recomendado' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: '0.75rem', bottom: '0.65rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '0.2rem',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isLogin && (
              <Input id="phone" label="Teléfono (opcional)" type="tel"
                placeholder="+57 300 000 0000"
                value={form.phone} onChange={updateField('phone')} />
            )}

            <Button
              type="submit" isLoading={loading}
              style={{
                width: '100%',
                marginTop: 'var(--space-1)',
                background: 'var(--brand-gold)',
                color: 'var(--brand-green)',
                fontWeight: '800',
                fontSize: 'var(--fs-base)',
                padding: '0.8rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
              }}
              size="lg"
              leftIcon={isLogin ? <ArrowRight size={ICON_SM} /> : <CheckCircle size={ICON_SM} />}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear mi cuenta'}
            </Button>
          </form>

          {/* Demo hint */}
          {isLogin && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              background: 'rgba(15,47,36,0.05)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--fs-xs)',
              color: 'var(--text-muted)',
              textAlign: 'center',
              lineHeight: 1.7,
              border: '1px solid rgba(15,47,36,0.08)',
            }}>
              <strong>Demo:</strong> demo@pasobet.com / demo123
            </div>
          )}

          {/* Switch */}
          <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button type="button" onClick={switchMode} style={{
              background: 'none', border: 'none', color: 'var(--brand-gold)',
              cursor: 'pointer', fontWeight: '700', fontSize: 'var(--fs-sm)',
              padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px',
            }}>
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>

      {/* Responsive: ocultar panel izquierdo en móvil */}
      <style>{`
        @media (max-width: 768px) {
          .login-hero { display: none !important; }
          .login-mobile-header { display: block !important; }
        }
        @media (min-width: 769px) {
          .login-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  );
};
