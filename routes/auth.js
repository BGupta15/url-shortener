//middleware is a function runs between request and responses
//middleware has req, res and next(function to pass control)
//middleware can do logging, auth or parsing

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

router.post('/register', async (req, res) =>{
    const {username, password} = req.body;
    if(!username||!password||password.length<6){
        return res.status(400).json({error: 'username and password(min 6 characters) is required'})
    }
    try {
        const hash = await bcrypt.hash(password, 12)//12 salt rounds
        await pool.query(
            'Insert into users (username, password_hash) values($1, $2)',
            [username, hash]
        );
        res.status(201).json({message: 'User created successfully'});
    } catch(err) {
        if(err.code==='23505')//error code for dupliate keys 
            return res.status(409).json({error: 'Username taken'});//409 for conflict
        res.status(500).json({error: err.message});
    }
});

router.post('/login', async (req, res)=> {
    const {username, password} = req.body;
    try{
        const result = await pool.query(
            'select * from users where username = $1', [username]
        );
        if(result.rows.length===0){
            return res.status(401).json({error: 'Invalid credentials'});
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if(!valid){
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const token = jwt.sign(
            {id: user.id, username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        res.json({ token, username: user.username});
    } catch (err){
        res.status(500).json({error : err.message});
    }
});

module.exports = router;