-- Migration: thêm cột QuizQuestionCount vào bảng Lessons
-- Chạy một lần trên database đang tồn tại (không ảnh hưởng learning_db.sql mới tạo)
USE learning_db;

ALTER TABLE Lessons
  ADD COLUMN IF NOT EXISTS QuizQuestionCount INT NOT NULL DEFAULT 10
  COMMENT 'Số câu hỏi Quiz do admin cấu hình cho từng bài học (4–30)';
