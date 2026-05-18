import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router();

// Public: Get all announcements
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected: Admin and Council can create
router.post('/', authMiddleware, roleMiddleware(['admin', 'council']), createAnnouncement);

// Protected: Edit own or admin can edit any
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'council']), updateAnnouncement);

// Protected: Delete own or admin can delete any
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'council']), deleteAnnouncement);

export default router;
