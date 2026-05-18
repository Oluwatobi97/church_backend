import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getFinanceIncome,
  getFinanceExpenses,
  createIncomeEntry,
  createExpenseEntry,
  updateIncomeEntry,
  updateExpenseEntry,
  deleteIncomeEntry,
  deleteExpenseEntry,
  getFinanceBalance,
  updateFinanceBalance,
} from '../controllers/financeController.js';

const router = express.Router();

// Public: Get finance data
router.get('/income', getFinanceIncome);
router.get('/expenses', getFinanceExpenses);
router.get('/balance', getFinanceBalance);

// Protected: Admin and Council can create/update/delete income
router.post('/income', authMiddleware, roleMiddleware(['admin', 'council']), createIncomeEntry);
router.put('/income/:id', authMiddleware, roleMiddleware(['admin', 'council']), updateIncomeEntry);
router.delete('/income/:id', authMiddleware, roleMiddleware(['admin', 'council']), deleteIncomeEntry);

// Protected: Admin and Council can create/update/delete expenses
router.post('/expenses', authMiddleware, roleMiddleware(['admin', 'council']), createExpenseEntry);
router.put('/expenses/:id', authMiddleware, roleMiddleware(['admin', 'council']), updateExpenseEntry);
router.delete('/expenses/:id', authMiddleware, roleMiddleware(['admin', 'council']), deleteExpenseEntry);

// Protected: Admin and Council can update balance
router.put('/balance', authMiddleware, roleMiddleware(['admin', 'council']), updateFinanceBalance);

export default router;
