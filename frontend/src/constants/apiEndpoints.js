// Đường dẫn API (tính từ VITE_API_URL, đi qua API Gateway)
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    GOOGLE_LOGIN: '/auth/google',
  },
  USERS: {
    STATS: '/users/stats',
  },
  LEARNING: {
    LESSONS: '/learning/lessons',
    lessonDetail: (lessonId) => `/learning/lessons/${lessonId}`,
    completeLesson: (lessonId) => `/learning/lessons/${lessonId}/complete`,
    QUIZ_START: '/learning/quiz/start',
    submitQuiz: (sessionId) => `/learning/quiz/${sessionId}/submit`,
    EXAMS: '/learning/exams',
    startExam: (examId) => `/learning/exams/${examId}/start`,
    submitExam: (sessionId) => `/learning/exams/sessions/${sessionId}/submit`,
    PROGRESS: '/learning/progress',
    MISTAKES: '/learning/mistakes',
    ADMIN_STATS: '/learning/admin/stats',
  },
};
