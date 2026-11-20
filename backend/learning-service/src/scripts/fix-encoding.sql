-- Fix ChapterTitle encoding cho tất cả lessons
UPDATE Lessons SET ChapterTitle = 'Khởi đầu từ những điều quen thuộc' WHERE Chapter = 1;
UPDATE Lessons SET ChapterTitle = 'Khám phá cuộc sống mỗi ngày' WHERE Chapter = 2;
UPDATE Lessons SET ChapterTitle = 'Học tập, công việc & sức khỏe' WHERE Chapter = 3;
UPDATE Lessons SET ChapterTitle = 'Kết nối với thế giới xung quanh' WHERE Chapter = 4;
UPDATE Lessons SET ChapterTitle = 'Mở rộng góc nhìn của bạn' WHERE Chapter = 5;
