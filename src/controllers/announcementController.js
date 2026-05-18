import pool from '../config/database.js';

// Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT a.*, u.name as created_by_name FROM announcements a JOIN users u ON a.created_by = u.id ORDER BY a.date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

// Get single announcement
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT a.*, u.name as created_by_name FROM announcements a JOIN users u ON a.created_by = u.id WHERE a.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching announcement:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
};

// Create announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, date } = req.body;
    const userId = req.user.id;

    if (!title || !content || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      'INSERT INTO announcements (title, content, date, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, date, userId]
    );

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, date } = req.body;
    const userId = req.user.id;

    // Check ownership
    const announcement = await pool.query('SELECT created_by FROM announcements WHERE id = $1', [id]);
    if (announcement.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this announcement' });
    }

    const result = await pool.query(
      'UPDATE announcements SET title = $1, content = $2, date = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, content, date, id]
    );

    res.json({
      message: 'Announcement updated successfully',
      announcement: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check ownership
    const announcement = await pool.query('SELECT created_by FROM announcements WHERE id = $1', [id]);
    if (announcement.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (announcement.rows[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this announcement' });
    }

    await pool.query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};
