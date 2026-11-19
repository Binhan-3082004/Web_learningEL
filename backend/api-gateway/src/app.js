// Khởi tạo ứng dụng Express của API Gateway
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const authenticate = require('./middlewares/authenticate');
const { authRateLimiter } = require('./middlewares/rateLimiter');
const notFoundHandler = require('./middlewares/notFoundHandler');
const proxyRoutes = require('./routes/proxyRoutes');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Giới hạn tần suất đăng nhập / đăng ký
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);

// Gateway không đọc body (express.json) để body được chuyển nguyên vẹn tới service phía sau
app.use(authenticate);
app.use(proxyRoutes);

app.use(notFoundHandler);

module.exports = app;
