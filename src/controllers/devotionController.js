import pool from '../config/database.js';

// Get all devotions
export const getDevotions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT d.*, u.name as created_by_name FROM devotions d JOIN users u ON d.created_by = u.id ORDER BY d.date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching devotions:', error);
    res.status(500).json({ error: 'Failed to fetch devotions' });
  }
};

// Get single devotion
export const getDevotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT d.*, u.name as created_by_name FROM devotions d JOIN users u ON d.created_by = u.id WHERE d.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Devotion not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching devotion:', error);
    res.status(500).json({ error: 'Failed to fetch devotion' });
  }
};

// Create devotion
export const createDevotion = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const userId = req.user.id;

    if (!title || !content || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO devotions (title, content, date, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, date, userId]
    );

    res.status(201).json({
      message: 'Devotion created successfully',
      devotion: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating devotion:', error);
    res.status(500).json({ error: 'Failed to create devotion' });
  }
};

// Update devotion
export const updateDevotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date } = req.body;
    const userId = req.user.id;

    // Check ownership
    const devotion = await pool.query('SELECT created_by FROM devotions WHERE id = $1', [id]);
    if (devotion.rows.length === 0) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    if (devotion.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this devotion' });
    }

    const result = await pool.query(
      'UPDATE devotions SET title = $1, content = $2, date = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, content, date, id]
    );

    res.json({
      message: 'Devotion updated successfully',
      devotion: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating devotion:', error);
    res.status(500).json({ error: 'Failed to update devotion' });
  }
};

// Delete devotion
export const deleteDevotion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const devotion = await pool.query('SELECT created_by FROM devotions WHERE id = $1', [id]);
    if (devotion.rows.length === 0) {
      return res.status(404).json({ error: 'Devotion not found' });
    }

    if (devotion.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this devotion' });
    }

    await pool.query('DELETE FROM devotions WHERE id = $1', [id]);
    res.json({ message: 'Devotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting devotion:', error);
    res.status(500).json({ error: 'Failed to delete devotion' });
  }
};
