const express = require('express');
const router = express.Router();
const pool = require('../db');
const redis = require('../redis')

router.get('/:code', async (req,res) => {
    const {code} = req.params;

    try{
        const cached = await redis.get(`url:${code}`);
        let originalUrl, expiresAt;
        if(cached){
            const data = JSON.parse(cached);
            originalUrl = data.original_url;
            expiresAt = data.expires_at;
        } else {
            const result = await pool.query(
                'Select original_url,expires_at from urls where shortened_url=$1',[code]
            );
            if(result.rows.length===0){
                return res.status(404).send('Short URL not found.');
            }
            const {original_url, expires_at} = result.rows[0];
            originalUrl = original_url;
            expiresAt = expires_at;
            let ttl = 3600; //stays in cache for 1 hour
            
            if(expiresAt){
                const secondsLeft = Math.floor((new Date(expiresAt) - Date.now())/1000);
                ttl = Math.min(ttl, secondsLeft);
            }
            
            if(ttl>0){
                await redis.setEx(`url:${code}`,ttl, JSON.stringify({original_url: originalUrl, expires_at: expiresAt}));
            }
        }
        if(expiresAt && new Date()> new Date(expiresAt)){
            await redis.del(`url:${code}`);
            return res.status(410).json({error: 'This link has expired'});
        }
        //didn;t use await here as users redirect shouldn't wait
        pool.query(
            'insert into clicks (short_url, referrer, ip_addrr, user_agent) values ($1, $2, $3, $4)',
            [code, 
            req.headers['referer']||null,
            req.ip,
            req.headers['user-agent']||null,
            ]
        ).catch(console.error);
        res.redirect(301, originalUrl); //301 is permanent redirection code
    } catch(err){
       