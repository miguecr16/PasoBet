import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, Event, HorseOnEvent } from '../types';
import {
  X, Target, AlertTriangle, CheckCircle,
  ChevronLeft, Award, AlertCircle, TrendingUp
} from 'lucide-react';

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

  const quickAmounts = [10000, 20000, 50000, 100000].filter((a) => a <= walletBalance);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(8,15,11,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 999, padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--r-2xl)',
          width: '100%', maxWidth: 440,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0B2318 0%, #1A4838 100%)',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <p style={{ color: 'var(--brand-gold)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Confirmar Apuesta
            </p>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: '900', fontSize: '1.25rem', fontFamily: 'var(--font-brand)', marginTop: '0.2rem' }}>
              {horse.horse.name}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Info Card */}
          <div style={{
            background: 'rgba(212,175,55,0.05)',
            border: '1px solid rgba(212,175,55,0.1)',
            borderRadius: 'var(--r-lg)',
            padding: '1rem', marginBottom: '1.5rem',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Cuota Actual</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--brand-gold)' }}>{horse.odds}x</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Saldo Disponible</span>
              <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>${walletBalance.toLocaleString('es-CO')}</p>
            </div>
          </div>

          {/* Quick selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Selección rápida:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {quickAmounts.map(qa => (
                <button
                  key={qa}
                  onClick={() => setAmount(qa.toString())}
                  style={{
                    padding: '0.5rem 0.8rem', borderRadius: 'var(--r-md)',
                    background: parsedAmount === qa ? 'var(--brand-gold)' : 'rgba(255,255,255,0.05)',
                    color: parsedAmount === qa ? '#000' : 'var(--text-primary)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  ${(qa / 1000)}K
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Monto Personalizado (COP)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-gold)', fontWeight: '800' }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000"
                style={{
                  width: '100%', padding: '0.8rem 1rem 0.8rem 2rem',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: 'var(--r-lg)', color: '#fff', fontWeight: '800', outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', color: '#F87171', fontSize: '0.75rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={14} /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--r-md)', color: '#4ADE80', fontSize: '0.75rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={14} /> {success}
              </motion.div>
            )}
            {isValidAmount && !success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.75rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 'var(--r-md)', color: 'var(--brand-gold)', fontSize: '0.75rem', fontWeight: '800', marginBottom: '1rem', textAlign: 'center' }}>
                Pago Potencial: ${(parsedAmount * horse.odds).toLocaleString('es-CO')} COP
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <button
            disabled={!isValidAmount || loading || !!success}
            onClick={handleBet}
            style={{
              width: '100%', padding: '1rem', borderRadius: 'var(--r-lg)',
              background: isValidAmount ? 'var(--brand-gold)' : 'rgba(255,255,255,0.05)',
              color: isValidAmount ? '#000' : 'rgba(255,255,255,0.2)',
              border: 'none', fontWeight: '900', fontSize: '1rem', cursor: isValidAmount ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            {loading ? <Spinner size={20} color="#000" /> : <><Target size={20} /> Realizar Apuesta</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
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
      const res = await api.get<ApiResponse<Event>>(`/events/${id}`);
      if (res.data?.success) setEvent(res.data.data);
    } catch (err: any) {
      setError('No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const canBet = event?.status === 'abierta' || event?.status === 'en_vivo';

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
      <Spinner size={36} color="var(--brand-gold)" />
      <p style={{ color: 'var(--brand-gold)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.15em' }}>CARGANDO COMPETENCIA...</p>
    </div>
  );

  if (error || !event) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>{error || 'Evento no encontrado'}</h2>
      <button onClick={() => navigate('/')} style={{ background: 'var(--brand-gold)', color: '#000', padding: '0.75rem 1.5rem', borderRadius: 'var(--r-lg)', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
        Volver a Ferias
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <AnimatePresence>
        {selectedHorse && (
          <BetModal
            horse={selectedHorse}
            eventId={event.id}
            walletBalance={wallet?.balance ?? 0}
            onClose={() => setSelectedHorse(null)}
            onSuccess={() => { refreshWallet(); loadEvent(); }}
          />
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Volver a Ferias
      </button>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2318 0%, #1A4838 100%)',
        borderRadius: 'var(--r-2xl)', border: '1px solid var(--border-gold)',
        padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
          {event.status === 'en_vivo' ? <span className="badge-live">En Vivo</span> : <span className="badge-activa">{event.status.toUpperCase()}</span>}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--brand-gold)" />
            <span style={{ color: 'var(--brand-gold)', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Competencia Oficial</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-brand)', fontWeight: '900', fontSize: '2.5rem', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {event.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '600' }}>
            {event.modalidad} • {event.sexo} • {event.edadRange}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Pool de Apuestas</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--brand-gold)', fontFamily: 'var(--font-brand)' }}>
              ${(event.totalPool || 0).toLocaleString('es-CO')}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Participantes</p>
            <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', fontFamily: 'var(--font-brand)' }}>
              {event.horses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Horses Grid */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <TrendingUp size={20} color="var(--brand-gold)" />
        <h2 style={{ fontFamily: 'var(--font-brand)', fontWeight: '900', fontSize: '1.5rem', color: '#fff' }}>Participantes &amp; Cuotas</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {event.horses.map((h, idx) => (
          <motion.div
            key={h.horseId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-card)',
              borderRadius: 'var(--r-xl)', padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'all 0.2s',
            }}
            whileHover={{ borderColor: 'var(--border-subtle)', y: -4, boxShadow: 'var(--shadow-md)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>{h.horse.name}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{h.horse.breed}</p>
              </div>
              <div style={{ background: 'rgba(212,175,55,0.1)', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-md)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <span style={{ color: 'var(--brand-gold)', fontWeight: '900', fontSize: '1.1rem' }}>{h.odds}x</span>
              </div>
            </div>

            {/* Stats or extra info */}
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--r-lg)' }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>G-P %</p>
                <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>{h.poolPercentage}%</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Carreras</p>
                <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>{h.horse.stats?.carrerasJugadas ?? 0}</p>
              </div>
            </div>

            {/* Action */}
            <button
              disabled={!canBet}
              onClick={() => setSelectedHorse(h)}
              style={{
                width: '100%', padding: '0.85rem', borderRadius: 'var(--r-lg)',
                background: canBet ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
                color: canBet ? 'var(--brand-gold)' : 'rgba(255,255,255,0.2)',
                border: `1px solid ${canBet ? 'var(--brand-gold)' : 'rgba(255,255,255,0.1)'}`,
                fontWeight: '900', fontSize: '0.85rem', cursor: canBet ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {canBet ? <><Target size={16} /> Apostar</> : 'Cerrado'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
