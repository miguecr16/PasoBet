import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, Feria } from '../types';
import {
  Award,
  ChevronRight,
  Radio,
  AlertCircle,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';

// ─── Icon size token ───────────────────────────────────────────────────────────
const ICON_SM = 14;

// Etiquetas de estado del evento (backend usa español)
const STATUS_LABELS: Record<string, string> = {
  abierta: 'Abierta',
  en_vivo: 'En vivo',
  cerrada: 'Cerrada',
  activa: 'Activa',
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ferias, setFerias] = useState<Feria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFerias();
  }, []);

  const loadFerias = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<ApiResponse<Feria[]>>('/events');

      if (res.data?.success) {
        setFerias(res.data.data ?? []);
      } else {
        setError(res.data?.message ?? 'No se pudieron cargar las ferias');
      }
    } catch (err: any) {
      setError(err?.message ?? 'No se pudieron cargar las ferias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 'var(--space-3)', color: 'var(--text-secondary)' }}>
        <Spinner size={36} color="var(--brand-green)" />
        <span style={{ fontSize: 'var(--fs-lg)' }}>Cargando información...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
          <AlertCircle size={48} color="var(--danger)" strokeWidth={1.5} />
        </div>
        <p style={{ color: 'var(--danger)', fontWeight: '600', marginBottom: 'var(--space-4)' }}>{error}</p>
        <Button variant="outline" leftIcon={<RefreshCw size={ICON_SM} />} onClick={loadFerias}>
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
      {/* ── Welcome section ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: '800', color: 'var(--brand-green)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Bienvenido, {user?.firstName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem', fontSize: 'var(--fs-base)' }}>
            Explora las ferias equinas y realiza tus apuestas en cada categoría
          </p>
        </div>

      </div>

      {/* ── Ferias section ───────────────────────────────────────────────────── */}
      {ferias.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
            <Building2 size={48} color="var(--text-muted)" strokeWidth={1.5} />
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-lg)' }}>No hay ferias disponibles en este momento.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          {ferias.map((feria) => (
            <section key={feria.id}>
              {/* Feria Header */}
              <div style={{ 
                borderLeft: '4px solid var(--brand-gold)', 
                paddingLeft: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                <div>
                  <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--brand-green)', marginBottom: '0.25rem' }}>
                    {feria.name}
                  </h2>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {feria.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> 
                      {new Date(feria.startDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} - {new Date(feria.endDate).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {feria.categories.length} Categorías
                </div>
              </div>

              {/* Categorías Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {feria.categories.map((cat) => {
                  const isLive = cat.status === 'en_curso';
                  return (
                    <Card
                      key={cat.id}
                      hoverable
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'white' }}
                      onClick={() => navigate(`/events/${cat.id}`)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isLive ? 'rgba(220,38,38,0.08)' : 'rgba(11,61,46,0.07)',
                          color: isLive ? 'var(--danger)' : 'var(--brand-green)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.2rem 0.5rem',
                          fontSize: '10px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                        }}>
                          {isLive ? <Radio size={10} /> : <Award size={10} />}
                          {STATUS_LABELS[cat.status] || cat.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 'var(--fs-base)', fontWeight: '700', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                        {cat.name}
                      </h3>

                      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
                        <div>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Caballos</p>
                          <p style={{ fontSize: 'var(--fs-lg)', fontWeight: '800', color: 'var(--brand-green)' }}>{cat.horseCount}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Apuestas</p>
                          <p style={{ fontSize: 'var(--fs-lg)', fontWeight: '800', color: 'var(--brand-gold-dark)' }}>{cat.betCount}</p>
                        </div>
                        <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
                          <ChevronRight size={20} color="var(--border-strong)" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

