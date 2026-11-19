import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Frontend chạy ở http://localhost:5173 (khớp với CORS_ORIGIN của api-gateway)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
