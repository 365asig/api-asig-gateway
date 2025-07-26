
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (laravelApiUrl, apiKey) => {
    const router = express.Router();

    const proxyOptions = (targetPath) => ({
        target: laravelApiUrl,
        changeOrigin: true,
        pathRewrite: () => '/api' + targetPath,
        onProxyReq: (proxyReq, req, res) => {
            console.log(`➡️ Proxying to: ${laravelApiUrl}/api${targetPath}`);
            proxyReq.setHeader('x-api-key', apiKey);

            if (req.body) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
        },
        onProxyRes: (proxyRes) => {
            console.log(`✅ Laravel response with status: ${proxyRes.statusCode}`);
        },
        onError: (err, req, res) => {
            console.error('❌ Proxy error:', err.message);
            res.status(500).json({ error: 'Proxy failed', details: err.message });
        }
    });

    router.post('/rca/calculate', createProxyMiddleware(proxyOptions('/rca/calculate')));
    router.post('/rca/save', createProxyMiddleware(proxyOptions('/rca/save')));
    router.get('/rca/file/:id/:type', (req, res, next) => {
        const { id, type } = req.params;
        return createProxyMiddleware(proxyOptions(`/rca/${id}/file/${type}`))(req, res, next);
    });

    router.post('/gc/calculate', createProxyMiddleware(proxyOptions('/green-card/calculate')));
    router.post('/gc/save', createProxyMiddleware(proxyOptions('/green-card/save')));
    router.get('/gc/file/:id/:type', (req, res, next) => {
        const { id, type } = req.params;
        return createProxyMiddleware(proxyOptions(`/green-card/${id}/file/${type}`))(req, res, next);
    });

    return router;
};
