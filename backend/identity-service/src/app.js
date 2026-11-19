// Khởi tạo ứng dụng Express: gắn middleware và routes (chưa lắng nghe cổng - việc đó ở server.js)
const express = require('express');
const { pool } = require('./config/db');
const routes = require('./routes');
const { requireInternalKey } = require('./middlewares/internalKeyMiddleware');
const { attachUser } = require('./middlewares/authMiddleware');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

// Kiểm tra sức khỏe dịch vụ (không cần x-internal-key)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'identity-service' });
  } catch {
    res.status(503).json({ status: 'db-down' });
  }
});

// Từ đây trở xuống chỉ nhận request đi qua API Gateway
app.use(requireInternalKey, attachUser);
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
