import { Router } from 'express';
import authRoutes from './auth.routes';
import { getEvents, getEventById } from '../controllers/event.controller';
import { placeBet, getMyBets } from '../controllers/bet.controller';
import { getWallet, deposit, withdraw } from '../controllers/wallet.controller';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller';
import { createEvent, updateEventStatus, createHorse, listHorses, assignHorse, settleEvent } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Auth
router.use('/auth', authRoutes);

// Events
router.get('/events', authenticate, getEvents);
router.get('/events/:id', authenticate, getEventById);

// Bets
router.post('/bets', authenticate, placeBet);
router.get('/bets/my', authenticate, getMyBets);

// Wallet
router.get('/wallet', authenticate, getWallet);
router.post('/wallet/deposit', authenticate, deposit);
router.post('/wallet/withdraw', authenticate, withdraw);

// Profile
router.get('/profile', authenticate, getProfile);
router.patch('/profile', authenticate, updateProfile);
router.post('/profile/change-password', authenticate, changePassword);

// Admin
router.post('/admin/events', authenticate, requireAdmin, createEvent);
router.patch('/admin/events/:id/status', authenticate, requireAdmin, updateEventStatus);
router.post('/admin/horses', authenticate, requireAdmin, createHorse);
router.get('/admin/horses', authenticate, requireAdmin, listHorses);
router.post('/admin/events/assign-horse', authenticate, requireAdmin, assignHorse);
router.post('/admin/events/settle', authenticate, requireAdmin, settleEvent);

export default router;
