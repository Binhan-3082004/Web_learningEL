-- Migration: Thêm trường Chapter, ChapterTitle, IsReview, ThumbnailUrl, Tag vào bảng Lessons
-- Chạy file này trực tiếp trên MySQL để cập nhật schema

ALTER TABLE Lessons 
  ADD COLUMN Chapter INT NOT NULL DEFAULT 1 AFTER Level,
  ADD COLUMN ChapterTitle VARCHAR(255) NOT NULL DEFAULT '' AFTER Chapter,
  ADD COLUMN IsReview TINYINT(1) NOT NULL DEFAULT 0 AFTER ChapterTitle,
  ADD COLUMN ThumbnailUrl VARCHAR(500) DEFAULT NULL AFTER IsReview,
  ADD COLUMN Tag VARCHAR(100) DEFAULT NULL AFTER ThumbnailUrl;

-- Cập nhật dữ liệu mẫu: gán Chapter dựa theo Level hiện tại
UPDATE Lessons SET Chapter = 1, ChapterTitle = 'Khởi đầu từ những điều quen thuộc' WHERE Level = 'A1';
UPDATE Lessons SET Chapter = 2, ChapterTitle = 'Khám phá cuộc sống mỗi ngày'        WHERE Level = 'A2';
UPDATE Lessons SET Chapter = 3, ChapterTitle = 'Học tập, công việc & sức khỏe'      WHERE Level = 'B1';
UPDATE Lessons SET Chapter = 4, ChapterTitle = 'Kết nối với thế giới xung quanh'    WHERE Level = 'B2';
UPDATE Lessons SET Chapter = 5, ChapterTitle = 'Mở rộng góc nhìn của bạn'           WHERE Level IN ('C1','C2');
