const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many requests'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = limiter;
