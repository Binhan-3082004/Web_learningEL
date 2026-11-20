// Cấu hình định tuyến (React Router) của toàn ứng dụng
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { ROLES } from '../constants/roles';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import LessonListPage from '../pages/LessonListPage';
import LessonDetailPage from '../pages/LessonDetailPage';
import QuizListPage from '../pages/QuizListPage';
import QuizPage from '../pages/QuizPage';
import ExamListPage from '../pages/ExamListPage';
import ExamPage from '../pages/ExamPage';
import ProgressPage from '../pages/ProgressPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminLessonsPage from '../pages/AdminLessonsPage';
import AdminVocabulariesPage from '../pages/AdminVocabulariesPage';
import AdminGrammarsPage from '../pages/AdminGrammarsPage';
import AdminExamsPage from '../pages/AdminExamsPage';
import AdminQuizPage from '../pages/AdminQuizPage';
import NotFoundPage from '../pages/NotFoundPage';
import GoogleCallbackPage from '../pages/GoogleCallbackPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang đăng nhập / đăng ký dùng khung riêng */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout />}>
        {/* Công khai */}
        <Route path="/" element={<HomePage />} />
        <Route path="/lessons" element={<LessonListPage />} />

        {/* Cần đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="/quiz" element={<QuizListPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/exams" element={<ExamListPage />} />
          <Route path="/exam/:examId" element={<ExamPage />} />
          <Route path="/progress" element={<ProgressPage />} />
        </Route>

        {/* Chỉ Admin */}
        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/lessons" element={<AdminLessonsPage />} />
          <Route path="/admin/vocabularies" element={<AdminVocabulariesPage />} />
          <Route path="/admin/grammars" element={<AdminGrammarsPage />} />
          <Route path="/admin/exams" element={<AdminExamsPage />} />
          <Route path="/admin/quiz" element={<AdminQuizPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
