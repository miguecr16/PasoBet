import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Removed duplicate import
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { ChevronLeft, TrendingUp, Target, Activity, AlertCircle } from 'lucide-react';

interface ProfileStatsData {
  user: {
    id: number;
    email: string;
    nombre: string;
    creadoEn: string;
  };
  stats: {
    metrics: {
      totalBets: number;
      wonBets: number;
      totalWagered: number;
      totalWon: number;
      winRate: number;
      roi: number;
    };
  };
}

export const ProfileStats: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/profile');
        const body = (res as any).data ?? res;
        if (body.success) {
          setData(body.data);
        } else {
          setError('Error cargando perfil');
        }
      } catch (err: any) {
        setError(err?.message || 'Error cargando perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spinner size={32} color="var(--brand-green)" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto var(--space-3)' }} />
        <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
      </div>
    );
  }

  const { metrics } = data.stats;
  const isPositiveRoi = metrics.roi > 0;
  const roiColor = isPositiveRoi ? 'var(--success)' : (metrics.roi < 0 ? 'var(--danger)' : 'var(--text-secondary)');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none', color: 'var(--brand-green)',
            cursor: 'pointer', fontSize: 'var(--fs-sm)', fontWeight: '600',
            marginBottom: 'var(--space-3)', padding: 0,
          }}
        >
          <ChevronLeft size={16} />
          Volver
        </button>

        <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: '800', color: 'var(--brand-green)' }}>
          Mi Rendimiento
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-base)' }}>
          Estadísticas de apuestas de {data.user.nombre}
        </p>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
        
        {/* Win Rate */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Target size={20} />
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: '600', textTransform: 'uppercase' }}>Win Rate (Acierto)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--fs-4xl)', fontWeight: '800', color: 'var(--brand-green)' }}>
              {metrics.winRate}%
            </span>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
              ({metrics.wonBets} de {metrics.totalBets} ganadas)
            </span>
          </div>
          <div style={{ height: '8px', width: '100%', background: 'rgba(11,61,46,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-2)' }}>
            <div style={{ height: '100%', width: `${metrics.winRate}%`, background: 'var(--brand-green)', borderRadius: '4px' }} />
          </div>
        </Card>

        {/* ROI */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Activity size={20} />
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: '600', textTransform: 'uppercase' }}>Retorno de Inversión (ROI)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: 'var(--fs-4xl)', fontWeight: '800', color: roiColor }}>
              {isPositiveRoi ? '+' : ''}{metrics.roi}%
            </span>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'auto' }}>
            Porcentaje de ganancia o pérdida neta sobre el total apostado.
          </p>
        </Card>

        {/* Totales */}
        <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <TrendingUp size={20} />
            <span style={{ fontSize: 'var(--fs-sm)', fontWeight: '600', textTransform: 'uppercase' }}>Movimientos en COP</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-medium)' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Total Apostado</span>
            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${metrics.totalWagered.toLocaleString('es-CO')}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sm)' }}>Pagos Recibidos</span>
            <span style={{ fontWeight: '800', color: 'var(--brand-gold-dark)' }}>${metrics.totalWon.toLocaleString('es-CO')}</span>
          </div>
        </Card>

      </div>
    </div>
  );
};
