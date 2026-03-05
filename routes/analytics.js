const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/:code', auth, async (req, res) => {
    const { code } = req.params;

    try {
        const urlResult = await pool.query(
            `select 
                u.shortened_url, 
                u.original_url, 
                u.created_at, 
                count(c.id)::int as total_clicks 
             from urls u 
             left join clicks c 
                on u.shortened_url = c.short_url
             where u.shortened_url = $1
             group by u.shortened_url, u.original_url, u.created_at`,
            [code]
        );

        if (urlResult.rows.length === 0) {
            return res.status(404).json({ error: 'short code not found' });
        }

        const referrers = await pool.query(
            `select referrer, count(*)::int as count 
             from clicks
             where short_url = $1 and referrer is not null
             group by referrer
             order by count desc
             limit 10`,
            [code]
        );

        const timeline = await pool.query(
            `select date(clicked_at) as date, count(*)::int as clicks
             from clicks 
             where short_url = $1
             group by date(clicked_at)
             order by date(clicked_at) asc
             limit 30`,
            [code]
        );

        res.json({
            ...urlResult.rows[0],
            short_code: code,
            top_referrers: referrers.rows,
            clicks_over_time: timeline.rows,
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;