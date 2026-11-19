// Đọc biến môi trường từ file .env và gom thành một object cấu hình duy nhất
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  identityServiceUrl: process.env.IDENTITY_URL || 'http://localhost:3001',
  learningServiceUrl: process.env.LEARNING_URL || 'http://localhost:3002',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  jwtSecret: process.env.JWT_SECRET,
  internalKey: process.env.INTERNAL_KEY,
};

if (!config.jwtSecret || !config.internalKey) {
  console.error('Thiếu JWT_SECRET hoặc INTERNAL_KEY trong file .env');
  process.exit(1);
}

module.exports = config;
