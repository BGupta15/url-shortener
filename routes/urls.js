const redis = require('redis')

router.get('/mine', authenticateToken, async(req, res)=>{
    const result = await pool.query(
        `select u.shortened_url, u.original_url, u.expires_at, u.is_custom, count(c.id) as total_clicks
        from urls u left join click c on u.shortened_url = c.short_url
        where u.created_by = $1
        group by u.shortened_url, u.original_url, u.expires_at, u.is_custom
        order by u.created_at desc`, [req.user.username]
    );
    res.json(result.rows);
});

router.delete('/:code', authenticateToken, async (req, res) =>{
    await pool.query(
        'delete from urls where short_code = $1 and created_by = $2',
        [req.params.code, req.user.username]
    );
    await redis.del(`url:${req.params.code}`);
    res.json({message: 'Deleted'});
})