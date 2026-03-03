const rateLimiter = require('express-rate-limit')

module.exports = rateLimiter({
    windowMs: 15 * 60 * 1000, //15mins
    max: 30, //max request 30 per window
    message: {error: 'Too many requests. Try again later.'},
    standardHeaders: true, //enables rate limit headers, limit, remaining, reset - allows frontend to know how many requests are allowed, how many are remaining and when reset happend
    legacyHeaders: false, //used by older apis - ruenef off to follow modernhttp standards
})