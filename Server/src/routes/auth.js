import express from 'express';
import {
  register,
  login,
  getCurrentUser,
  getAllUsers
} from '../controllers/authController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);

export default router;
