"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const event_controller_1 = require("../controllers/event.controller");
const bet_controller_1 = require("../controllers/bet.controller");
const wallet_controller_1 = require("../controllers/wallet.controller");
const profile_controller_1 = require("../controllers/profile.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Auth
router.use('/auth', auth_routes_1.default);
// Events
router.get('/events', auth_middleware_1.authenticate, event_controller_1.getEvents);
router.get('/events/:id', auth_middleware_1.authenticate, event_controller_1.getEventById);
// Bets
router.post('/bets', auth_middleware_1.authenticate, bet_controller_1.placeBet);
router.get('/bets/my', auth_middleware_1.authenticate, bet_controller_1.getMyBets);
// Wallet
router.get('/wallet', auth_middleware_1.authenticate, wallet_controller_1.getWallet);
router.post('/wallet/deposit', auth_middleware_1.authenticate, wallet_controller_1.deposit);
router.post('/wallet/withdraw', auth_middleware_1.authenticate, wallet_controller_1.withdraw);
// Profile
router.get('/profile', auth_middleware_1.authenticate, profile_controller_1.getProfile);
router.patch('/profile', auth_middleware_1.authenticate, profile_controller_1.updateProfile);
router.post('/profile/change-password', auth_middleware_1.authenticate, profile_controller_1.changePassword);
// Admin
router.post('/admin/events', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.createEvent);
router.patch('/admin/events/:id/status', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.updateEventStatus);
router.post('/admin/horses', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.createHorse);
router.get('/admin/horses', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.listHorses);
router.post('/admin/events/assign-horse', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.assignHorse);
router.post('/admin/events/settle', auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, admin_controller_1.settleEvent);
exports.default = router;
