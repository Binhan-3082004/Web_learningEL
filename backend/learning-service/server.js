// Điểm khởi chạy của Learning Service: chỉ lắng nghe cổng, toàn bộ cấu hình app nằm trong src/app.js
const app = require('./src/app');
const config = require('./src/config');

app.listen(config.port, () => {
  console.log(`Learning Service chạy tại cổng ${config.port}`);
});
