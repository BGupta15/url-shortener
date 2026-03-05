const redis = require('redis');
const client = redis.createClient();
const express = require('express');
const router = express.Router();
const pool = require('../db')
const authenticateToken = require('../middleware/auth');

router.get('/mine', authenticateToken, async(req, res)=>{
     try {
        console.log("User from token:", req.user);

        const result = await pool.query(
            `select u.shortened_url, u.original_url, u.expires_at, u.is_custom, count(c.id) as total_clicks
            from urls u left join clicks c on u.shortened_url = c.short_url
            where u.created_by = $1
            group by u.shortened_url, u.original_url, u.expires_at, u.is_custom, u.created_at
            order by u.created_at desc`,
            [req.user.username]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:code', authenticateToken, async (req, res) => {
    const { code } = req.params;

    console.log("DELETE REQUEST");
    console.log("Code:", code);
    console.log("User from token:", req.user);

    try {
        const result = await pool.query(
            'DELETE FROM urls WHERE shortened_url = $1 AND created_by = $2 RETURNING *',
            [code, req.user.username]
        );

        console.log("Deleted rows:", result.rowCount);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'URL not found or not yours' });
        }
        await client.del(code);
        res.json({ message: 'Deleted Successfully' });

    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router