import pool from '../config/database.js';

// Get finance income
export const getFinanceIncome = async (req, res) => {
  try {
    const { week_starting } = req.query;

    let query = 'SELECT f.*, u.name as created_by_name FROM finance_income f JOIN users u ON f.created_by = u.id';
    const params = [];

    if (week_starting) {
      query += ' WHERE f.week_starting = $1';
      params.push(week_starting);
    }

    query += ' ORDER BY f.week_starting DESC, f.category';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching finance income:', error);
    res.status(500).json({ error: 'Failed to fetch finance income' });
  }
};

// Get finance expenses
export const getFinanceExpenses = async (req, res) => {
  try {
    const { week_starting } = req.query;

    let query = 'SELECT f.*, u.name as created_by_name FROM finance_expenses f JOIN users u ON f.created_by = u.id';
    const params = [];

    if (week_starting) {
      query += ' WHERE f.week_starting = $1';
      params.push(week_starting);
    }

    query += ' ORDER BY f.week_starting DESC, f.category';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching finance expenses:', error);
    res.status(500).json({ error: 'Failed to fetch finance expenses' });
  }
};

// Create income entry
export const createIncomeEntry = async (req, res) => {
  try {
    const { category, amount, week_starting } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !week_starting) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO finance_income (category, amount, week_starting, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, amount, week_starting, userId]
    );

    res.status(201).json({
      message: 'Income entry created successfully',
      income: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating income entry:', error);
    res.status(500).json({ error: 'Failed to create income entry' });
  }
};

// Create expense entry
export const createExpenseEntry = async (req, res) => {
  try {
    const { category, amount, week_starting } = req.body;
    const userId = req.user.id;

    if (!category || !amount || !week_starting) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO finance_expenses (category, amount, week_starting, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, amount, week_starting, userId]
    );

    res.status(201).json({
      message: 'Expense entry created successfully',
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating expense entry:', error);
    res.status(500).json({ error: 'Failed to create expense entry' });
  }
};

// Update income entry
export const updateIncomeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, week_starting } = req.body;

    const result = await pool.query(
      'UPDATE finance_income SET category = $1, amount = $2, week_starting = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [category, amount, week_starting, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Income entry not found' });
    }

    res.json({
      message: 'Income entry updated successfully',
      income: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating income entry:', error);
    res.status(500).json({ error: 'Failed to update income entry' });
  }
};

// Update expense entry
export const updateExpenseEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, week_starting } = req.body;

    const result = await pool.query(
      'UPDATE finance_expenses SET category = $1, amount = $2, week_starting = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [category, amount, week_starting, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    res.json({
      message: 'Expense entry updated successfully',
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating expense entry:', error);
    res.status(500).json({ error: 'Failed to update expense entry' });
  }
};

// Delete income entry
export const deleteIncomeEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM finance_income WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Income entry not found' });
    }

    res.json({ message: 'Income entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting income entry:', error);
    res.status(500).json({ error: 'Failed to delete income entry' });
  }
};

// Delete expense entry
export const deleteExpenseEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM finance_expenses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense entry not found' });
    }

    res.json({ message: 'Expense entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    res.status(500).json({ error: 'Failed to delete expense entry' });
  }
};

// Get finance balance
export const getFinanceBalance = async (req, res) => {
  try {
    const { week_starting } = req.query;

    let query = 'SELECT * FROM finance_balance';
    const params = [];

    if (week_starting) {
      query += ' WHERE week_starting = $1';
      params.push(week_starting);
    }

    query += ' ORDER BY week_starting DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching finance balance:', error);
    res.status(500).json({ error: 'Failed to fetch finance balance' });
  }
};

// Update or create balance
export const updateFinanceBalance = async (req, res) => {
  try {
    const { week_starting, balance_carried_down } = req.body;
    const userId = req.user.id;

    if (!week_starting || balance_carried_down === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Try to update, if not found, insert
    let result = await pool.query(
      'UPDATE finance_balance SET balance_carried_down = $1, updated_at = CURRENT_TIMESTAMP WHERE week_starting = $2 RETURNING *',
      [balance_carried_down, week_starting]
    );

    if (result.rows.length === 0) {
      result = await pool.query(
        'INSERT INTO finance_balance (week_starting, balance_carried_down, created_by) VALUES ($1, $2, $3) RETURNING *',
        [week_starting, balance_carried_down, userId]
      );
    }

    res.json({
      message: 'Finance balance updated successfully',
      balance: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating finance balance:', error);
    res.status(500).json({ error: 'Failed to update finance balance' });
  }
};
