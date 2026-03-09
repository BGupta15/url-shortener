const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

router.get('/mine', authenticateToken, async (req, res) => {
  try {
    console.log("User from token:", req.user);

    const result = await pool.query(
      `SELECT u.shortened_url, u.original_url, u.expires_at, u.is_custom,
              COUNT(c.id) AS total_clicks
       FROM urls u
       LEFT JOIN clicks c ON u.shortened_url = c.short_url
       WHERE u.created_by = $1
       GROUP BY u.shortened_url, u.original_url, u.expires_at, u.is_custom, u.created_at
       ORDER BY u.created_at DESC`,
      [req.user.username]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /mine error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:code', authenticateToken, async (req, res) => {
  const { code } = req.params;

  console.log("DELETE REQUEST for code:", code);
  console.log("User from token:", req.user);

  try {
    await pool.query(
      'DELETE FROM clicks WHERE short_url = $1',
      [code]
    );

    const result = await pool.query(
      'DELETE FROM urls WHERE shortened_url = $1 AND created_by = $2 RETURNING *',
      [code, req.user.username]
    );

    console.log("Deleted rows:", result.rowCount);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'URL not found or not yours' });
    }

    try {
      const redis = require('../redis');
      await redis.del(`url:${code}`);
    } catch (redisErr) {
      console.warn('Redis delete skipped:', redisErr.message);
    }

    res.json({ message: 'Deleted Successfully' });
  } catch (err) {
    console.error("DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;