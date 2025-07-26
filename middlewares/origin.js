const allowedOrigins = [
    'http://localhost:3002'
];

module.exports = (req, res, next) => {
    const origin = req.headers.origin || req.headers.referer;
    console.log(origin);

    if (!origin) {
        return res.status(403).json({ message: 'Authorization denied' });
    }

    if (!allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return res.status(403).json({ message: 'Authorization denied' });
    }

    next();
};
