const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const logFile = path.join(__dirname, '../logs/info.log');

module.exports = (req, res, next) => {
    const originalSend = res.send;

    res.send = function (body) {
        if (res.statusCode === 401 || res.statusCode === 403) {
            const logEntry = `${new Date().toISOString()} - IP: ${req.ip} - ${req.method} ${req.originalUrl} - Status: ${res.statusCode}\n`;
            fs.appendFile(logFile, logEntry, (err) => {
                if (err) console.error('Failed  request:', err);
            });
        }
        return originalSend.apply(this, arguments);
    };

    next();
};
