const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token)
        return res.status(401).json({error: 'No token provided'});//401 is for unauthorized
    try{
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();//passes on control
    } catch(err){
        res.status(403).json({error: 'invalid or expired token'});//403 for forbidden
    }
};