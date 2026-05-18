import pool from '../config/database.js';

// Get attendance records
export const getAttendance = async (req, res) => {
  try {
    const { week_starting } = req.query;

    let query = 'SELECT a.*, u.name as created_by_name FROM attendance a JOIN users u ON a.created_by = u.id';
    const params = [];

    if (week_starting) {
      query += ' WHERE a.week_starting = $1';
      params.push(week_starting);
    }

    query += ' ORDER BY a.week_starting DESC, a.day';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Get single attendance record
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT a.*, u.name as created_by_name FROM attendance a JOIN users u ON a.created_by = u.id WHERE a.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

// Create attendance record
export const createAttendance = async (req, res) => {
  try {
    const {
      day,
      week_starting,
      total_adults,
      total_children,
      total_offering,
      total_tithes,
      total_newcomers,
      special_programme,
    } = req.body;
    const userId = req.user.id;

    if (!day || !week_starting) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO attendance (day, week_starting, total_adults, total_children, total_offering, total_tithes, total_newcomers, special_programme, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [day, week_starting, total_adults || 0, total_children || 0, total_offering || 0, total_tithes || 0, total_newcomers || 0, special_programme, userId]
    );

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Attendance record already exists for this day and week' });
    }
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
};

// Update attendance record
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      day,
      week_starting,
      total_adults,
      total_children,
      total_offering,
      total_tithes,
      total_newcomers,
      special_programme,
    } = req.body;

    const result = await pool.query(
      `UPDATE attendance SET 
        day = $1, week_starting = $2, total_adults = $3, total_children = $4,
        total_offering = $5, total_tithes = $6, total_newcomers = $7,
        special_programme = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [day, week_starting, total_adults, total_children, total_offering, total_tithes, total_newcomers, special_programme, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({
      message: 'Attendance record updated successfully',
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
};

// Delete attendance record
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
};
