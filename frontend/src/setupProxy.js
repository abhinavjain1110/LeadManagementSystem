const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: /* 'http://localhost:5000' */'leadmanagementsystem-production.up.railway.app',
      changeOrigin: true,
      secure: false,
      onProxyReq: function(proxyReq, req, res) {
        // Log proxy requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Proxying:', req.method, req.url, '->', proxyReq.path);
        }
      },
    })
  );
};

