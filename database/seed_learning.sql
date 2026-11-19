-- Dữ liệu mẫu để demo Quiz / Thi thử (chạy sau learning_db.sql)
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE learning_db;

INSERT INTO Vocabularies (Word, Pronunciation, Meaning, Example, Level) VALUES
('apple','/ˈæp.əl/','quả táo','I eat an apple every day.','A1'),
('book','/bʊk/','quyển sách','She is reading a book.','A1'),
('water','/ˈwɔː.tər/','nước','Please give me a glass of water.','A1'),
('teacher','/ˈtiː.tʃər/','giáo viên','My teacher is very kind.','A1'),
('friend','/frend/','bạn bè','He is my best friend.','A1'),
('family','/ˈfæm.əl.i/','gia đình','I have a big family.','A1'),
('school','/skuːl/','trường học','The school opens at 7 a.m.','A1'),
('happy','/ˈhæp.i/','vui vẻ','She looks happy today.','A1'),
('schedule','/ˈʃedʒ.uːl/','lịch trình','Let me check my schedule.','A2'),
('improve','/ɪmˈpruːv/','cải thiện','I want to improve my English.','A2'),
('journey','/ˈdʒɜː.ni/','chuyến đi','The journey took three hours.','A2'),
('efficient','/ɪˈfɪʃ.ənt/','hiệu quả','This method is very efficient.','B1');

INSERT INTO Lessons (Title, Level, Description, SortOrder) VALUES
('Daily Life Basics','A1','Từ vựng và ngữ pháp nền tảng cho giao tiếp hằng ngày.',1),
('Planning & Improving','A2','Từ vựng về kế hoạch, hành trình và cải thiện bản thân.',2);

INSERT INTO LessonVocabularies (LessonId, VocabularyId) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),
(2,9),(2,10),(2,11),(2,12);

INSERT INTO GrammarStructures (Pattern, Meaning, Level, `Usage`) VALUES
('S + am/is/are + noun/adjective','Động từ to be ở thì hiện tại đơn','A1','Dùng để nói về danh tính, nghề nghiệp, trạng thái.'),
('S + V(s/es) + O','Thì hiện tại đơn','A1','Dùng cho thói quen, sự thật hiển nhiên. Ngôi thứ ba số ít thêm s/es.');

INSERT INTO GrammarExamples (GrammarId, Sentence, Translation) VALUES
(1,'She is a teacher.','Cô ấy là giáo viên.'),
(1,'They are happy.','Họ đang vui.'),
(2,'He drinks water every morning.','Anh ấy uống nước mỗi sáng.'),
(2,'I read a book every night.','Tôi đọc sách mỗi tối.');

INSERT INTO LessonGrammars (LessonId, GrammarId) VALUES (1,1),(1,2);

INSERT INTO Exams (Title, ExamType, DurationMinutes, Description) VALUES
('Bài kiểm tra xếp trình độ','PLACEMENT',15,'Đánh giá nhanh trình độ để đề xuất lộ trình học.');

INSERT INTO ExamQuestions (ExamId, Section, Content, Options, CorrectOption, Explanation, SortOrder) VALUES
(1,'Grammar','She ___ a teacher.','{"A":"am","B":"is","C":"are","D":"be"}','B','Chủ ngữ she đi với is.',1),
(1,'Grammar','They ___ football every Sunday.','{"A":"plays","B":"play","C":"playing","D":"is play"}','B','Chủ ngữ they dùng động từ nguyên mẫu.',2),
(1,'Grammar','I have lived here ___ 2015.','{"A":"for","B":"since","C":"during","D":"from"}','B','since + mốc thời gian.',3),
(1,'Grammar','If it rains tomorrow, we ___ at home.','{"A":"stay","B":"stayed","C":"will stay","D":"would stay"}','C','Câu điều kiện loại 1.',4),
(1,'Grammar','The report must be ___ by Friday.','{"A":"submit","B":"submitted","C":"submitting","D":"submits"}','B','Bị động sau must be: V3/ed.',5),
(1,'Vocabulary','Choose the word closest in meaning to "efficient".','{"A":"wasteful","B":"productive","C":"slow","D":"careless"}','B','efficient = làm việc hiệu quả, năng suất.',6);
