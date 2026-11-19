// Đọc biến môi trường từ file .env và gom thành một object cấu hình duy nhất
require('dotenv').config();

const DEFAULT_TIMEZONE = '+07:00';
const isValidTimezone = (value) => /^[+-]\d{2}:\d{2}$/.test(value || '');

const config = {
  port: Number(process.env.PORT || 3002),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'learning_db',
    timezone: isValidTimezone(process.env.DB_TIMEZONE) ? process.env.DB_TIMEZONE : DEFAULT_TIMEZONE,
  },
  internalKey: process.env.INTERNAL_KEY,
};

if (!config.internalKey) {
  console.error('Thiếu INTERNAL_KEY trong file .env');
  process.exit(1);
}

module.exports = config;
