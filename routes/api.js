const express = require('express');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (laravelApiUrl, apiKey) => {
    const router = express.Router();

    // ✅ Agent HTTP cu Keep-Alive
    const keepAliveAgent = new http.Agent({
        keepAlive: true,
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000,
        keepAliveMsecs: 30000,
    });

    const proxyOptions = (targetPath) => ({
        target: laravelApiUrl,
        changeOrigin: true,
        pathRewrite: () => '/api' + targetPath,
        agent: keepAliveAgent,
        onProxyReq: (proxyReq, req, res) => {
            console.log(`➡️ Proxying to: ${laravelApiUrl}/api${targetPath}`);
            proxyReq.setHeader('x-api-key', apiKey);

            if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
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

    // ✅ Routes RCA
    router.post('/rca/calculate', createProxyMiddleware(proxyOptions('/rca/calculate')));
    router.post('/rca/save', createProxyMiddleware(proxyOptions('/rca/save')));
    router.get('/rca/file/:id/:type', (req, res, next) => {
        const { id, type } = req.params;
        return createProxyMiddleware(proxyOptions(`/rca/${id}/file/${type}`))(req, res, next);
    });

    // ✅ Routes Green Card
    router.post('/green-card/calculate', createProxyMiddleware(proxyOptions('/green-card/calculate')));
    router.post('/green-card/calculate/save', createProxyMiddleware(proxyOptions('/green-card/save')));
    router.get('/green-card/file/:id/:type', (req, res, next) => {
        const { id, type } = req.params;
        return createProxyMiddleware(proxyOptions(`/green-card/${id}/file/${type}`))(req, res, next);
    });

    // ✅ Routes Travel Medical
    router.get('/travel-medical/destinations', createProxyMiddleware(proxyOptions('/travel-medical/destinations')));
    router.get('/travel-medical/products', createProxyMiddleware(proxyOptions('/travel-medical/products')));
    router.get('/travel-medical/regions', createProxyMiddleware(proxyOptions('/travel-medical/regions')));
    router.get('/travel-medical/scopes', createProxyMiddleware(proxyOptions('/travel-medical/scopes')));

    router.options('/travel-medical/donaris/calculate', (req, res) => res.sendStatus(204)); // pentru preflight CORS
    router.post('/travel-medical/donaris/calculate', createProxyMiddleware(proxyOptions('/travel-medical/donaris/calculate')));
    router.post('/travel-medical/donaris/save', createProxyMiddleware(proxyOptions('/travel-medical/donaris/save')));
    router.get('/travel-medical/donaris/:id/file/:type', (req, res, next) => {
        const { id, type } = req.params;
        return createProxyMiddleware(proxyOptions(`/travel-medical/donaris/${id}/file/${type}`))(req, res, next);
    });

    return router;
};