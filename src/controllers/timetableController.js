import pool from '../config/database.js';

// Get timetable records
export const getTimetable = async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = 'SELECT t.*, u.name as created_by_name FROM timetable t JOIN users u ON t.created_by = u.id';
    const params = [];

    if (month && year) {
      query += ' WHERE t.month = $1 AND t.year = $2';
      params.push(month, parseInt(year));
    }

    query += ' ORDER BY t.year DESC, t.month DESC, t.week_number, t.day';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

// Get single timetable entry
export const getTimetableById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT t.*, u.name as created_by_name FROM timetable t JOIN users u ON t.created_by = u.id WHERE t.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

// Create timetable entry
export const createTimetable = async (req, res) => {
  try {
    const { week_number, day, month, year, minister_name } = req.body;
    const userId = req.user.id;

    if (!week_number || !day || !month || !year || !minister_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO timetable (week_number, day, month, year, minister_name, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [week_number, day, month, year, minister_name, userId]
    );

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating timetable:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Timetable entry already exists for this week, day, month, and year' });
    }
    res.status(500).json({ error: 'Failed to create timetable entry' });
  }
};

// Update timetable entry
export const updateTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const { week_number, day, month, year, minister_name } = req.body;

    const result = await pool.query(
      `UPDATE timetable SET week_number = $1, day = $2, month = $3, year = $4, minister_name = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *`,
      [week_number, day, month, year, minister_name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }

    res.json({
      message: 'Timetable entry updated successfully',
      timetable: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating timetable:', error);
    res.status(500).json({ error: 'Failed to update timetable entry' });
  }
};

// Delete timetable entry
export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM timetable WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timetable entry not found' });
    }

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ error: 'Failed to delete timetable entry' });
  }
};
