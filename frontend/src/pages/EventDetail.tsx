import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, Event, HorseOnEvent } from '../types';
import {
  X,
  Target,
  Coins,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Award,
  AlertCircle,
  Ban,
  Flag,
} from 'lucide-react';

// ─── Icon size tokens ──────────────────────────────────────────────────────────
const ICON_SM = 14;
const ICON_MD = 16;

// ─── Bet Modal ────────────────────────────────────────────────────────────────
interface BetModalProps {
  horse: HorseOnEvent;
  eventId: string | number;
  walletBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BetModal: React.FC<BetModalProps> = ({ horse, eventId, walletBalance, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parsedAmount = Number(amount.replace(/\D/g, ''));
  const isValidAmount = parsedAmount >= 1000 && parsedAmount <= walletBalance;

  const handleBet = async () => {
    if (!isValidAmount) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/bets', {
        eventId: String(eventId),
        horseId: String(horse.horseId),
        amount: parsedAmount,
      });
      setSuccess(`Apuesta de $${parsedAmount.toLocaleString('es-CO')} realizada a ${horse.horse.name}`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      const message = err?.message ?? 'Error al realizar la apuesta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [5000, 10000, 20000, 50000].filter((a) => a <= walletBalance);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(11,61,46,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999,
        padding: 'var(--space-4)',
        animation: 'fadeIn 0.2s ease forwards',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 420,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          background: 'var(--brand-green)',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '2px solid var(--brand-gold)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--fs-xs)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Apostar a Ganador
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
              <Award size={ICON_MD} color="var(--brand-gold)" />
              <h3 style={{ color: 'var(--brand-gold)', fontWeight: '800', fontSize: 'var(--fs-lg)' }}>
                {horse.horse.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              color: '#fff', borderRadius: 'var(--radius-sm)',
              width: 32, height: 32, cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: 'var(--space-5)' }}>
          {/* Horse info */}
          <div style={{
            background: 'rgba(11,61,46,0.05)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
          }}>
            {horse.horse.breed && (
              <div>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>Criadero</span>
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight: '600', color: 'var(--text-primary)' }}>{horse.horse.breed}</p>
              </div>
            )}
            <div>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: '600' }}>Cuota</span>
              <p style={{ fontSize: 'var(--fs-sm)', fontWeight: '700', color: 'var(--brand-gold-dark)' }}>{horse.odds}x</p>
            </div>
          </div>

          {/* Wallet balance */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-3)',
          }}>
            <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)' }}>Tu saldo:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700', color: 'var(--brand-green)', fontSize: 'var(--fs-base)' }}>
              <Coins size={ICON_MD} />
              ${walletBalance.toLocaleString('es-CO')} COP
            </span>
          </div>

          {/* Quick amount chips */}
          {quickAmounts.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  style={{
                    background: parsedAmount === qa ? 'var(--brand-green)' : 'rgba(11,61,46,0.08)',
                    color: parsedAmount === qa ? '#fff' : 'var(--brand-green)',
                    border: `1.5px solid ${parsedAmount === qa ? 'var(--brand-green)' : 'var(--border-medium)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.35rem 0.75rem',
                    fontSize: 'var(--fs-xs)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  ${(qa / 1000)}K
                </button>
              ))}
            </div>
          )}

          {/* Amount input */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--fs-sm)', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>
              Monto a apostar (COP)
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', fontWeight: '600', fontSize: 'var(--fs-sm)',
              }}>$</span>
              <input
                type="number"
                min={1000}
                max={walletBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000"
                style={{
                  width: '100%',
                  background: '#fff',
                  border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem 1rem 0.65rem 1.75rem',
                  fontSize: 'var(--fs-base)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand-green)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,61,46,0.12)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border-medium)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
            {parsedAmount > 0 && !isValidAmount && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)', marginTop: '0.3rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={12} />
                {parsedAmount < 1000 ? 'Mínimo $1,000 COP' : 'Saldo insuficiente'}
              </p>
            )}
            {parsedAmount >= 1000 && isValidAmount && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--success)', marginTop: '0.3rem', fontWeight: '600' }}>
                Ganancia potencial: ${(parsedAmount * horse.odds).toLocaleString('es-CO')} COP ({horse.odds}x)
              </p>
            )}
          </div>

          {/* Feedback messages */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)', color: 'var(--danger)', fontSize: 'var(--fs-sm)', fontWeight: '500' }}>
              <AlertTriangle size={ICON_SM} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(22,163,74,0.10)', border: '1px solid rgba(22,163,74,0.30)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-3)', color: 'var(--success)', fontSize: 'var(--fs-sm)', fontWeight: '600' }}>
              <CheckCircle size={ICON_SM} style={{ flexShrink: 0 }} />
              {success}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="outline" onClick={onClose} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              isLoading={loading}
              disabled={!isValidAmount || !!success}
              onClick={handleBet}
              style={{ flex: 2 }}
              leftIcon={<Target size={ICON_SM} />}
            >
              {loading ? '' : `Apostar $${parsedAmount > 0 ? parsedAmount.toLocaleString('es-CO') : '—'}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Event Detail Page ────────────────────────────────────────────────────────
export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHorse, setSelectedHorse] = useState<HorseOnEvent | null>(null);

  useEffect(() => {
    if (id) loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get<ApiResponse<Event>>(`/events/${id}`);
      // El interceptor devuelve la respuesta completa de axios
      const body: ApiResponse<Event> = (res as any).data ?? res;
      if (body.success) {
        setEvent(body.data);
      } else {
        throw new Error(body.message ?? 'No se pudo cargar el evento');
      }
    } catch (err: any) {
      const message = err?.message ?? 'No se pudo cargar el evento';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // El backend usa: 'abierta', 'en_curso', 'cerrada'
  const canBet = event?.status === 'abierta' || event?.status === 'en_curso';
  const isClosed = event?.status === 'cerrada';

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 'var(--space-3)', color: 'var(--text-secondary)' }}>
        <Spinner size={36} color="var(--brand-green)" />
        <span style={{ fontSize: 'var(--fs-lg)' }}>Cargando feria...</span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
          <AlertCircle size={48} color="var(--danger)" strokeWidth={1.5} />
        </div>
        <p style={{ color: 'var(--danger)', marginBottom: 'var(--space-4)', fontWeight: '600' }}>{error}</p>
        <Button variant="outline" leftIcon={<ChevronLeft size={ICON_SM} />} onClick={() => navigate('/')}>
          Volver a Ferias
        </Button>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease forwards' }}>
      {/* Bet Modal */}
      {selectedHorse && (
        <BetModal
          horse={selectedHorse}
          eventId={event.id}
          walletBalance={wallet?.balance ?? 0}
          onClose={() => setSelectedHorse(null)}
          onSuccess={() => {
            refreshWallet();
            loadEvent();
          }}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
          <ChevronLeft size={ICON_SM} />
          Volver a Ferias
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--fs-3xl)', fontWeight: '800', color: 'var(--brand-green)', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {event.name}
            </h1>
          </div>
          <Badge status={event.status} />
        </div>
      </div>

      {/* ── Status banner ──────────────────────────────────────────────────── */}
      {!canBet && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          background: isClosed ? 'rgba(22,163,74,0.08)' : 'rgba(107,114,128,0.08)',
          border: `1px solid ${isClosed ? 'rgba(22,163,74,0.25)' : 'rgba(107,114,128,0.25)'}`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-5)',
          fontSize: 'var(--fs-sm)',
          color: isClosed ? 'var(--success)' : 'var(--text-muted)',
          fontWeight: '500',
        }}>
          {isClosed
            ? <><Flag size={ICON_MD} style={{ flexShrink: 0 }} /> Este evento ha finalizado. No se aceptan nuevas apuestas.</>
            : <><Ban size={ICON_MD} style={{ flexShrink: 0 }} /> Este evento no está disponible para apuestas.</>
          }
        </div>
      )}

      {/* ── Horses section ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={ICON_MD + 2} color="var(--brand-green)" />
          <h2 style={{ fontSize: 'var(--fs-xl)', fontWeight: '700', color: 'var(--text-primary)' }}>
            Caballos Participantes ({event.horses.length})
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            background: 'rgba(11,61,46,0.05)',
            padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-md)'
          }}>
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pool Total</span>
            <span style={{ fontSize: 'var(--fs-base)', fontWeight: '800', color: 'var(--brand-green)' }}>
              ${(event.totalPool || 0).toLocaleString('es-CO')}
            </span>
          </div>
          {canBet && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'rgba(212,175,55,0.12)',
              color: 'var(--brand-gold-dark)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.3rem 0.75rem',
              fontSize: 'var(--fs-xs)',
              fontWeight: '700',
            }}>
              <Coins size={ICON_SM} />
              Saldo: ${(wallet?.balance ?? 0).toLocaleString('es-CO')}
            </span>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {event.horses.map((h) => (
          <Card key={h.horseId} hoverable style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {/* Odds header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{
                background: 'var(--brand-green)',
                color: 'var(--brand-gold)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.625rem',
                fontSize: 'var(--fs-xs)',
                fontWeight: '800',
                letterSpacing: '0.05em',
              }}>
                <Award size={11} style={{ display: 'inline', marginRight: 4 }} />
                Participante
              </div>
              <div style={{
                background: 'rgba(212,175,55,0.12)',
                color: 'var(--brand-gold-dark)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.25rem 0.625rem',
                fontSize: 'var(--fs-sm)',
                fontWeight: '800',
              }}>
                {h.odds}x
              </div>
            </div>

            {/* Horse name */}
            <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: '800', color: 'var(--brand-green)', lineHeight: 1.2 }}>
              {h.horse.name}
            </h3>

            {/* Breed */}
            {h.horse.breed && (
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', fontWeight: '500' }}>
                Criadero: {h.horse.breed}
              </p>
            )}



            {/* Bet button */}
            <Button
              variant={canBet ? 'primary' : 'ghost'}
              style={{ width: '100%', marginTop: 'auto' }}
              disabled={!canBet}
              onClick={() => setSelectedHorse(h)}
              leftIcon={canBet ? <Target size={ICON_SM} /> : undefined}
            >
              {canBet ? 'Apostar a este caballo' : 'Apuestas cerradas'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
