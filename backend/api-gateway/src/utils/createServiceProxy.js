// Tạo middleware chuyển tiếp (reverse proxy) request tới một microservice
const { createProxyMiddleware } = require('http-proxy-middleware');

const PROXY_TIMEOUT_MS = 20000;

/**
 * @param {string} targetUrl địa chỉ của service, ví dụ http://localhost:3001
 * @param {string|string[]} pathFilter các đường dẫn sẽ được chuyển tới service này
 */
function createServiceProxy(targetUrl, pathFilter) {
  return createProxyMiddleware({
    target: targetUrl,
    pathFilter,
    changeOrigin: true,
    xfwd: true,
    proxyTimeout: PROXY_TIMEOUT_MS,
    on: {
      error: (error, req, res) => {
        console.error('Proxy error:', error.code || error.message);
        if (res && typeof res.writeHead === 'function' && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Dịch vụ tạm thời không khả dụng' }));
        }
      },
    },
  });
}

module.exports = createServiceProxy;
