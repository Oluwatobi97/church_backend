import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getDevotions,
  getDevotionById,
  createDevotion,
  updateDevotion,
  deleteDevotion,
} from '../controllers/devotionController.js';

const router = express.Router();

// Public: Get all devotions
router.get('/', getDevotions);
router.get('/:id', getDevotionById);

// Protected: Admin and Council can create
router.post('/', authMiddleware, roleMiddleware(['admin', 'council']), createDevotion);

// Protected: Edit own or admin can edit any
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'council']), updateDevotion);

// Protected: Delete own or admin can delete any
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'council']), deleteDevotion);

export default router;
