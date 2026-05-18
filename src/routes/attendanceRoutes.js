import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';

const router = express.Router();

// Public: Get attendance records
router.get('/', getAttendance);
router.get('/:id', getAttendanceById);

// Protected: Admin and Council can create
router.post('/', authMiddleware, roleMiddleware(['admin', 'council']), createAttendance);

// Protected: Admin and Council can update
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'council']), updateAttendance);

// Protected: Admin can delete
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteAttendance);

export default router;
