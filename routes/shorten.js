const express = require('express');
const redis = require('../redis');
const router = express.Router();
const { nanoid } = require('nanoid');
const pool = require('../db')
const auth = require('../middleware/auth')
const limiter = require('../middleware/rateLimiter');

router.post('/', auth, limiter, async (req, res)=>{
    const {url, alias, expires_in_days} = req.body;
    if(!url || !url.startsWith('http')){
        return res.status(400).json({error:'A valid URL is required'})
    }
    try{
        const expiresAt = expires_in_days? new Date(Date.now() + expires_in_days * 86400000) : null;
        const shortCode = alias? alias : nanoid(7);
        const isCustom = !!alias;
        if(alias && !/^[a-zA-Z0-9_-]{3,20}$/.test(alias)){
            return res.status(400).json({
                error : 'Alias must be 3-20 characters: letter, numbers, hyphens and underscores only'
            });
        }
        const exists = await pool.query(
            'select 1 from urls where shortened_url = $1',[shortCode]
        );
        if(exists.rows.length>0){
            return res.status(409).json({error: 'Alias already taken'});
        }
        await redis.del(`url:${shortCode}`);
        await pool.query(
            'insert into urls (original_url, shortened_url, is_custom, created_by, expires_at) values ($1, $2, $3, $4, $5)',
            [url, shortCode, isCustom, req.user.username ||'anonymous', expiresAt]
        );
        res.json({
            short_url: `${process.env.BASE_URL}/${shortCode}`,
            shortCode: shortCode,
            original_url: url,
            is_custom: isCustom
        });
    } catch(err){
        res.status(500).json({error: 'Database error', detail: err.message })
    }
});

module.exports = router;