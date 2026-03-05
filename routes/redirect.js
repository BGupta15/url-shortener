const express = require('express');
const router = express.Router();
const pool = require('../db');
const redis = require('../redis')

router.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    let originalUrl, expiresAt;

    const cached = await redis.get(`url:${code}`);

    if (cached) {
      const data = JSON.parse(cached);
      originalUrl = data.original_url;
      expiresAt = data.expires_at;
    } else {
      const result = await pool.query(
        'SELECT original_url, expires_at FROM urls WHERE shortened_url = $1',
        [code]
      );

      if (result.rowCount === 0) {
        return res.status(404).send('Short URL not found.');
      }

      originalUrl = result.rows[0].original_url;
      expiresAt = result.rows[0].expires_at;

      await redis.setEx(
        `url:${code}`,
        3600,
        JSON.stringify({ original_url: originalUrl, expires_at: expiresAt })
      );
    }

    if (expiresAt && new Date() > new Date(expiresAt)) {
      await redis.del(`url:${code}`);
      return res.status(410).json({ error: 'Expired' });
    }

    await pool.query(
      `INSERT INTO clicks (short_url, referrer, ip_addrr, user_agent)
       VALUES ($1,$2,$3,$4)`,
      [
        code,
        req.headers['referer'] || null,
        req.ip,
        req.headers['user-agent'] || null
      ]
    );

    res.redirect(302, originalUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;