// Điểm khởi chạy của API Gateway
const app = require('./src/app');
const config = require('./src/config');

app.listen(config.port, () => {
  console.log(`API Gateway chạy tại http://localhost:${config.port}`);
});
