import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getTimetable,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from '../controllers/timetableController.js';

const router = express.Router();

// Public: Get timetable
router.get('/', getTimetable);
router.get('/:id', getTimetableById);

// Protected: Only Admin can create
router.post('/', authMiddleware, roleMiddleware(['admin']), createTimetable);

// Protected: Only Admin can update
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateTimetable);

// Protected: Only Admin can delete
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteTimetable);

export default router;
