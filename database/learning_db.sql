-- Learning Service database (Tuần 6-8): bài học, từ vựng, ngữ pháp, Quiz, Thi thử, tiến độ
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS learning_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learning_db;

CREATE TABLE IF NOT EXISTS Lessons (
  Id          INT AUTO_INCREMENT PRIMARY KEY,
  Title       VARCHAR(256) NOT NULL,
  Level       VARCHAR(10)  NOT NULL,             -- A1..C2
  Description TEXT NULL,
  SortOrder   INT NOT NULL DEFAULT 0,
  CreatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lessons_level (Level, SortOrder)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS Vocabularies (
  Id            INT AUTO_INCREMENT PRIMARY KEY,
  Word          VARCHAR(100) NOT NULL,
  Pronunciation VARCHAR(100) NULL,
  Meaning       TEXT NOT NULL,
  Example       TEXT NULL,
  Level         VARCHAR(20) NOT NULL DEFAULT 'A1',
  AudioUrl      VARCHAR(512) NULL,
  INDEX idx_vocab_word (Word),
  INDEX idx_vocab_level (Level)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS LessonVocabularies (
  LessonId     INT NOT NULL,
  VocabularyId INT NOT NULL,
  PRIMARY KEY (LessonId, VocabularyId),
  FOREIGN KEY (LessonId)     REFERENCES Lessons(Id)      ON DELETE CASCADE,
  FOREIGN KEY (VocabularyId) REFERENCES Vocabularies(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GrammarStructures (
  Id      INT AUTO_INCREMENT PRIMARY KEY,
  Pattern VARCHAR(256) NOT NULL,
  Meaning TEXT NULL,
  Level   VARCHAR(10) NOT NULL DEFAULT 'A1',
  `Usage` TEXT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS GrammarExamples (
  Id          INT AUTO_INCREMENT PRIMARY KEY,
  GrammarId   INT NOT NULL,
  Sentence    TEXT NOT NULL,
  Translation TEXT NULL,
  FOREIGN KEY (GrammarId) REFERENCES GrammarStructures(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS LessonGrammars (
  LessonId  INT NOT NULL,
  GrammarId INT NOT NULL,
  PRIMARY KEY (LessonId, GrammarId),
  FOREIGN KEY (LessonId)  REFERENCES Lessons(Id)           ON DELETE CASCADE,
  FOREIGN KEY (GrammarId) REFERENCES GrammarStructures(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Thi thử (TOEIC / IELTS / kiểm tra đầu vào)
CREATE TABLE IF NOT EXISTS Exams (
  Id              INT AUTO_INCREMENT PRIMARY KEY,
  Title           VARCHAR(256) NOT NULL,
  ExamType        VARCHAR(20)  NOT NULL DEFAULT 'TOEIC',  -- TOEIC | IELTS | PLACEMENT
  DurationMinutes INT NOT NULL DEFAULT 30,
  Description     TEXT NULL,
  CreatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ExamQuestions (
  Id            INT AUTO_INCREMENT PRIMARY KEY,
  ExamId        INT NOT NULL,
  Section       VARCHAR(50) NOT NULL DEFAULT 'Grammar', -- Listening | Reading | Grammar | Vocabulary
  Content       TEXT NOT NULL,
  Options       JSON NOT NULL,                          -- {"A":"...","B":"...","C":"...","D":"..."}
  CorrectOption CHAR(1) NOT NULL,
  Explanation   TEXT NULL,
  AudioUrl      VARCHAR(512) NULL,
  SortOrder     INT NOT NULL DEFAULT 0,
  FOREIGN KEY (ExamId) REFERENCES Exams(Id) ON DELETE CASCADE,
  INDEX idx_eq_exam (ExamId, SortOrder)
) ENGINE=InnoDB;

-- Tiến độ & kết quả (UserId tham chiếu logic sang Identity Service, không có FK liên DB)
CREATE TABLE IF NOT EXISTS LessonProgresses (
  Id          INT AUTO_INCREMENT PRIMARY KEY,
  UserId      INT NOT NULL,
  LessonId    INT NOT NULL,
  IsCompleted TINYINT(1) NOT NULL DEFAULT 0,
  CompletedAt DATETIME NULL,
  UNIQUE KEY uq_user_lesson (UserId, LessonId),
  FOREIGN KEY (LessonId) REFERENCES Lessons(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PracticeSessions (
  Id             INT AUTO_INCREMENT PRIMARY KEY,
  UserId         INT NOT NULL,
  SessionType    VARCHAR(50) NOT NULL,                  -- quiz | exam
  RefId          INT NULL,                              -- lessonId (quiz) hoặc examId (exam)
  Score          INT NULL,                              -- phần trăm 0-100
  TotalQuestions INT NOT NULL DEFAULT 0,
  CorrectCount   INT NOT NULL DEFAULT 0,
  StartTime      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  EndTime        DATETIME NULL,
  INDEX idx_ps_user (UserId, StartTime)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS PracticeMistakes (
  Id         INT AUTO_INCREMENT PRIMARY KEY,
  SessionId  INT NOT NULL,
  ItemType   VARCHAR(20) NOT NULL,                      -- vocab | question
  ItemId     INT NOT NULL,
  UserAnswer TEXT NULL,
  FOREIGN KEY (SessionId) REFERENCES PracticeSessions(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS RankingPointLogs (
  Id        INT AUTO_INCREMENT PRIMARY KEY,
  UserId    INT NOT NULL,
  Points    INT NOT NULL,
  Reason    VARCHAR(256) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rank_user (UserId)
) ENGINE=InnoDB;

-- Danh sách câu hỏi của mỗi lượt Quiz (để chấm điểm phía server, chống gian lận)
CREATE TABLE IF NOT EXISTS QuizSessionItems (
  SessionId    INT NOT NULL,
  VocabularyId INT NOT NULL,
  QuestionType VARCHAR(30) NOT NULL,                    -- word_to_meaning | meaning_to_word
  PRIMARY KEY (SessionId, VocabularyId),
  FOREIGN KEY (SessionId)    REFERENCES PracticeSessions(Id) ON DELETE CASCADE,
  FOREIGN KEY (VocabularyId) REFERENCES Vocabularies(Id)     ON DELETE CASCADE
) ENGINE=InnoDB;
