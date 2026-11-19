// Tạo file .env từ .env.example cho cả 4 phần của dự án (chạy được trên Windows / macOS / Linux)
// Dùng: npm run setup:env   (file .env đã có sẽ được giữ nguyên, không bị ghi đè)
const fs = require('fs');
const path = require('path');

const PROJECT_FOLDERS = ['backend/api-gateway', 'backend/identity-service', 'backend/learning-service', 'frontend'];

for (const folder of PROJECT_FOLDERS) {
  const examplePath = path.join(__dirname, '..', folder, '.env.example');
  const envPath = path.join(__dirname, '..', folder, '.env');

  if (fs.existsSync(envPath)) {
    console.log(`- ${folder}/.env đã tồn tại, bỏ qua`);
  } else {
    fs.copyFileSync(examplePath, envPath);
    console.log(`+ Đã tạo ${folder}/.env`);
  }
}

console.log('\nNhớ mở backend/identity-service/.env và backend/learning-service/.env để điền DB_PASSWORD (mật khẩu MySQL).');
