# English Learning – Hệ thống học tiếng Anh (ReactJS + Node.js Microservices)

Đồ án: *Xây dựng hệ thống học tiếng Anh tích hợp trợ lí ảo AI theo kiến trúc Microservices dựa trên công nghệ ReactJS và NodeJS.*

> Chatbot AI (tuần 9–10) chưa nằm trong bản này.

## 1. Kiến trúc

```
                    ┌────────────────────────────────────────────────────────────┐
 Trình duyệt        │                        BACKEND (Node.js)                   │
 ┌──────────┐       │                                                            │
 │ FRONTEND │       │   ┌───────────────┐      ┌───────────────────┐             │
 │  React   │ ───►  │   │  API Gateway  │ ───► │ Identity Service  │──► identity_db
 │  :5173   │       │   │     :3000     │      │      :3001        │   (MySQL)   │
 └──────────┘       │   │ xác thực JWT  │      │ đăng ký/đăng nhập │             │
                    │   │ RBAC lớp 1    │      │ JWT + bcrypt, RBAC│             │
                    │   │ rate limit    │      └───────────────────┘             │
                    │   │               │      ┌───────────────────┐             │
                    │   │               │ ───► │ Learning Service  │──► learning_db
                    │   └───────────────┘      │      :3002        │   (MySQL)   │
                    │                          │ bài học, Quiz,    │             │
                    │                          │ thi thử, tiến độ  │             │
                    │                          └───────────────────┘             │
                    └────────────────────────────────────────────────────────────┘
```

Frontend **chỉ gọi API Gateway (cổng 3000)**. Gọi thẳng vào 3001/3002 sẽ bị từ chối (403).

## 2. Cấu trúc thư mục

```
english-learning-ms/
├── frontend/                      # ===== FRONT-END: React (Vite + Tailwind) =====
│   ├── src/
│   │   ├── assets/                # Hình ảnh, logo
│   │   ├── components/            # Component dùng chung (Navbar, Footer, ProtectedRoute, Loading...)
│   │   ├── layouts/               # Khung bố cục trang (MainLayout, AuthLayout)
│   │   ├── pages/                 # Các màn hình (HomePage, LoginPage, QuizPage, ExamPage...)
│   │   ├── hooks/                 # Custom hooks (useAuth, useCountdown)
│   │   ├── context/               # AuthContext (trạng thái đăng nhập toàn cục)
│   │   ├── services/              # Gọi API (apiClient, authService, quizService...)
│   │   ├── utils/                 # Hàm tiện ích (formatTime, getErrorMessage)
│   │   ├── constants/             # Hằng số (endpoint API, vai trò, khóa localStorage)
│   │   ├── routes/                # Cấu hình React Router (AppRoutes)
│   │   ├── styles/                # CSS toàn cục (Tailwind)
│   │   ├── App.jsx                # Component gốc
│   │   └── main.jsx               # Entry point gắn React vào DOM
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                       # ===== BACK-END: 3 dịch vụ Node.js độc lập =====
│   ├── api-gateway/               # Cổng API: xác thực JWT, phân quyền, chuyển tiếp request
│   │   ├── src/
│   │   │   ├── config/            # Biến môi trường, quy tắc route công khai/admin
│   │   │   ├── middlewares/       # authenticate, rateLimiter, notFoundHandler
│   │   │   ├── routes/            # Bảng định tuyến tới các service
│   │   │   ├── utils/             # createServiceProxy
│   │   │   └── app.js
│   │   ├── server.js              # Điểm khởi chạy (listen cổng 3000)
│   │   ├── package.json
│   │   └── .env.example
│   │
│   ├── identity-service/          # Dịch vụ định danh (cổng 3001, DB: identity_db)
│   │   ├── src/
│   │   │   ├── config/            # index.js (env), db.js (kết nối MySQL + transaction)
│   │   │   ├── controllers/       # authController, userController
│   │   │   ├── services/          # authService, userService, tokenService (logic nghiệp vụ)
│   │   │   ├── models/            # userModel, roleModel, refreshTokenModel (câu SQL)
│   │   │   ├── routes/            # authRoutes, userRoutes
│   │   │   ├── middlewares/       # internalKeyMiddleware, authMiddleware, errorHandler
│   │   │   ├── utils/             # HttpError, asyncHandler, validators, pagination...
│   │   │   ├── scripts/           # seedAdmin.js (tạo tài khoản admin đầu tiên)
│   │   │   └── app.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── learning-service/          # Dịch vụ học tập (cổng 3002, DB: learning_db)
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/       # lesson, vocabulary, quiz, exam, progress
│       │   │   └── admin/         # Controller quản trị học liệu (vocabulary, grammar, lesson, exam, statistics)
│       │   ├── services/          # quizService, examService, progressService, lessonService...
│       │   ├── models/            # lessonModel, vocabularyModel, examModel, practiceSessionModel...
│       │   ├── routes/            # lessonRoutes, quizRoutes, examRoutes, adminRoutes...
│       │   ├── middlewares/       # internalKey, auth, errorHandler, uploadMiddleware (Excel)
│       │   ├── validators/        # Kiểm tra dữ liệu body (vocabulary, grammar, lesson, exam)
│       │   ├── utils/             # HttpError, constants, shuffle, calculateStreak...
│       │   └── app.js
│       ├── server.js
│       ├── package.json
│       └── .env.example
│
├── database/                      # Script tạo CSDL MySQL
│   ├── identity_db.sql
│   ├── learning_db.sql
│   └── seed_learning.sql          # Dữ liệu mẫu (từ vựng, bài học, đề thi xếp trình độ)
│
├── scripts/setup-env.js           # Tự tạo các file .env
├── package.json                   # Lệnh chạy tiện lợi cho cả dự án
└── README.md
```

Mỗi service backend theo luồng: **routes → controllers → services → models → MySQL**

| Lớp | Việc duy nhất của lớp đó |
|---|---|
| `routes` | Khai báo đường dẫn + middleware, nối tới controller |
| `controllers` | Nhận request, gọi service, trả response |
| `services` | Logic nghiệp vụ (chấm điểm, kiểm tra điều kiện, transaction) |
| `models` | Câu lệnh SQL, không chứa logic |
| `middlewares` | Xác thực, phân quyền, bắt lỗi |

## 3. Hướng dẫn chạy chương trình

### Bước 0 – Cài sẵn

| Phần mềm | Phiên bản | Kiểm tra |
|---|---|---|
| Node.js | ≥ 18 (khuyên dùng 20 trở lên) | `node -v` |
| MySQL Server | ≥ 8.0 | `mysql --version` |

Đảm bảo MySQL đang chạy (Windows: mở *Services* → `MySQL80` → Start).

### Bước 1 – Cài thư viện (chạy ở thư mục gốc `english-learning-ms/`)

```bash
npm install            # cài concurrently (chạy nhiều phần cùng lúc)
npm run install:all    # cài thư viện cho 3 service backend + frontend
```

### Bước 2 – Tạo file `.env`

```bash
npm run setup:env
```

Lệnh trên tạo `.env` cho cả 4 phần từ file `.env.example` (chạy được trên Windows/macOS/Linux).
Sau đó **mở 2 file và điền mật khẩu MySQL** của bạn vào `DB_PASSWORD=`:

- `backend/identity-service/.env`
- `backend/learning-service/.env`

Các giá trị `JWT_SECRET` và `INTERNAL_KEY` đã giống nhau ở các service nên chạy được ngay. Khi triển khai thật hãy đổi sang chuỗi bí mật của riêng bạn (nhưng vẫn phải **giống nhau**):

| Biến | Phải giống ở |
|---|---|
| `JWT_SECRET` | api-gateway, identity-service |
| `INTERNAL_KEY` | api-gateway, identity-service, learning-service |

### Bước 3 – Tạo cơ sở dữ liệu (chạy ở thư mục gốc)

```bash
mysql -u root -p -e "source database/identity_db.sql"
mysql -u root -p -e "source database/learning_db.sql"
mysql -u root -p -e "source database/seed_learning.sql"
```

Mỗi lệnh sẽ hỏi mật khẩu MySQL. (Cách dùng `-e "source ..."` chạy được cả trên Windows PowerShell/CMD.)
Hoặc dùng MySQL Workbench: *File → Open SQL Script* → chạy lần lượt 3 file theo đúng thứ tự trên.

Kết quả: có 2 database `identity_db` và `learning_db`, kèm 12 từ vựng, 2 bài học, 2 cấu trúc ngữ pháp và 1 đề kiểm tra xếp trình độ.

### Bước 4 – Tạo tài khoản Admin đầu tiên

```bash
npm run seed:admin
```

Tài khoản mặc định (đổi trong `backend/identity-service/.env`): **admin / Admin@12345**

### Bước 5 – Chạy toàn bộ hệ thống

```bash
npm run dev
```

Lệnh này khởi động đồng thời 4 phần:

| Phần | Địa chỉ |
|---|---|
| API Gateway | http://localhost:3000 |
| Identity Service | http://localhost:3001 (nội bộ) |
| Learning Service | http://localhost:3002 (nội bộ) |
| **Frontend (mở bằng trình duyệt)** | **http://localhost:5173** |

Muốn chạy riêng từng phần (mở 4 cửa sổ terminal): `npm run dev:gateway`, `npm run dev:identity`, `npm run dev:learning`, `npm run dev:frontend`.

### Bước 6 – Kiểm tra hoạt động

1. Mở http://localhost:3000/health → thấy `{"status":"ok","service":"api-gateway"}`.
2. Mở http://localhost:5173 → bấm **Đăng ký**, tạo tài khoản người học, đăng nhập.
3. Thử: **Bài học** → mở bài *Daily Life Basics* → **Quiz** → **Thi thử** (làm bài kiểm tra xếp trình độ) → **Tiến độ**.
4. Đăng nhập `admin / Admin@12345` → menu **Quản trị** hiện ra (người học thường không thấy và bị chặn).

Thử API bằng dòng lệnh / Postman (qua cổng 3000):

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"Admin@12345"}'

curl http://localhost:3000/api/learning/lessons
```

### Lỗi thường gặp

| Hiện tượng | Nguyên nhân / cách sửa |
|---|---|
| `ER_ACCESS_DENIED_ERROR` | Sai `DB_PASSWORD` / `DB_USER` trong `.env` của identity/learning |
| `ECONNREFUSED 127.0.0.1:3306` | MySQL chưa chạy |
| `ER_BAD_DB_ERROR: Unknown database` | Chưa chạy Bước 3 |
| `Thiếu JWT_SECRET hoặc INTERNAL_KEY` | Chưa tạo `.env` (Bước 2) |
| Gọi API báo 403 *"Chỉ được truy cập qua API Gateway"* | Đang gọi thẳng cổng 3001/3002, hoặc `INTERNAL_KEY` không giống nhau giữa các service |
| Đăng nhập được nhưng gọi API khác báo 401 *"Token không hợp lệ"* | `JWT_SECRET` ở gateway khác identity-service |
| Trình duyệt báo lỗi CORS | `CORS_ORIGIN` trong `api-gateway/.env` phải đúng địa chỉ frontend (`http://localhost:5173`) |
| *"Dịch vụ tạm thời không khả dụng"* (502) | Một service phía sau chưa chạy hoặc bị lỗi, xem terminal của service đó |
| `EADDRINUSE` | Cổng 3000/3001/3002/5173 đang bị chương trình khác dùng |
| *"Không có từ vựng cho lựa chọn này"* khi làm Quiz | Chưa chạy `seed_learning.sql` |

## 4. Bảo mật hoạt động như thế nào

1. Mật khẩu băm bằng bcrypt (`bcryptjs`, 10 vòng) trước khi lưu.
2. Đăng nhập trả **access token** (JWT, 15 phút) và **refresh token** (7 ngày, lưu dạng SHA-256, xoay vòng mỗi lần refresh; dùng lại token cũ sẽ thu hồi toàn bộ phiên).
3. **Gateway** xác thực JWT, xóa mọi header `x-user-*` do client gửi, rồi gắn `x-user-id`, `x-user-roles`, `x-internal-key` trước khi chuyển tiếp.
4. **RBAC hai lớp**: Gateway chặn `/api/users/**` và `/api/learning/admin/**` nếu không có role `admin`; từng service kiểm tra lại bằng `requireRole`. Frontend ẩn/chặn route bằng `ProtectedRoute`.

## 5. Danh sách API (qua Gateway, tiền tố `http://localhost:3000`)

| Method & đường dẫn | Quyền | Mô tả |
|---|---|---|
| POST `/api/auth/register` · `login` · `refresh` · `logout` | Công khai | Đăng ký, đăng nhập `{usernameOrEmail,password}`, làm mới token, đăng xuất |
| GET/PUT `/api/auth/me` · PUT `/api/auth/change-password` | Đăng nhập | Hồ sơ cá nhân, đổi mật khẩu |
| GET `/api/users` · `/stats` · PATCH `/:id/status` · PUT `/:id/roles` | Admin | Quản lý người dùng, khóa/mở khóa, phân quyền |
| GET `/api/learning/lessons?level=` | Công khai | Danh sách bài học |
| GET `/api/learning/lessons/:id` · POST `/lessons/:id/complete` | Đăng nhập | Chi tiết bài (từ vựng + ngữ pháp), đánh dấu hoàn thành |
| GET `/api/learning/vocabularies` · `/flashcards?lessonId=` | Đăng nhập | Tra từ, bộ flashcard |
| POST `/api/learning/quiz/start` · `/quiz/:sessionId/submit` | Đăng nhập | Tạo Quiz, nộp và chấm điểm |
| GET `/api/learning/exams` · POST `/exams/:id/start` · POST `/exams/sessions/:sid/submit` · GET `/exams/sessions/:sid/review` | Đăng nhập | Thi thử, chấm điểm, xem lại bài |
| GET `/api/learning/progress` · `/sessions` · `/mistakes` · `/ranking/me` | Đăng nhập | Tiến độ, lịch sử, điểm yếu, điểm tích lũy |
| `/api/learning/admin/{vocabularies,grammars,lessons,exams}` (CRUD), `POST /exams/:id/questions`, `PUT/DELETE /questions/:id`, `POST /vocabularies/import` (.xlsx), `GET /stats` | Admin | Quản lý học liệu và thống kê |

## 6. Đối chiếu cấu trúc cũ → mới

| Bản cũ (file zip) | Bản mới |
|---|---|
| `api-gateway/src/index.js` | `backend/api-gateway/{server.js, src/app.js, src/config, src/middlewares, src/routes}` |
| `identity-service/src/routes/auth.js` | `routes/authRoutes.js` + `controllers/authController.js` + `services/authService.js` + `models/*` |
| `identity-service/src/routes/users.js` | `routes/userRoutes.js` + `controllers/userController.js` + `services/userService.js` |
| `identity-service/src/{db,config}.js` | `config/db.js`, `config/index.js` |
| `identity-service/src/middleware/auth.js` | `middlewares/internalKeyMiddleware.js` + `middlewares/authMiddleware.js` |
| `identity-service/src/utils/{http,tokens}.js` | `utils/{HttpError,asyncHandler,pagination,...}.js`, `services/tokenService.js` |
| `identity-service/src/seed.js` | `scripts/seedAdmin.js` |
| `learning-service/src/routes/{lessons,vocabulary,quiz,exams,progress}.js` | `routes/*Routes.js` + `controllers/*Controller.js` + `services/*Service.js` + `models/*Model.js` |
| `learning-service/src/routes/admin.js` (306 dòng) | `routes/adminRoutes.js` + `controllers/admin/*` + `validators/*` + `services/{grammar,lesson,vocabularyImport}Service.js` |
| `learning-service/src/utils/validate.js` | `validators/commonValidator.js` |
| `learning-service/src/services/points.js` | `services/pointService.js` + `models/pointModel.js` |
| `frontend-snippets/apiClient.js` | `frontend/src/services/apiClient.js` |
| `frontend-snippets/AuthContext.jsx` | `frontend/src/context/AuthContext.jsx` + `hooks/useAuth.js` |
| `frontend-snippets/ProtectedRoute.jsx` | `frontend/src/components/ProtectedRoute.jsx` |
| `frontend-snippets/QuizPage.jsx`, `ExamPage.jsx` | `frontend/src/pages/QuizPage.jsx`, `ExamPage.jsx` (+ `hooks/useCountdown.js`) |
| *(chưa có)* | `frontend/src/pages/{Home,Login,Register,LessonList,LessonDetail,ExamList,Progress,AdminDashboard,NotFound}Page.jsx`, `layouts/`, `routes/` – bổ sung để chạy được toàn bộ giao diện |

Toàn bộ đường dẫn API, bảng CSDL và hành vi nghiệp vụ được giữ nguyên so với bản cũ, nên Postman collection và báo cáo (ERD, bảng dữ liệu) không bị ảnh hưởng.

## 7. Ghi chú

- Khóa tài khoản thu hồi ngay refresh token, nhưng access token đang dùng còn hiệu lực tối đa 15 phút.
- Token lưu trong `localStorage` cho đơn giản.
- Các điểm khác biệt giữa CSDL và báo cáo hiện tại (cần cập nhật ERD / Bảng 2.x): `Users` có thêm `PhoneNumber`, `IsActive`; `VARCHAR(MAX)` là cú pháp SQL Server, MySQL dùng `TEXT`; thêm các bảng `LessonGrammars`, `Exams`, `ExamQuestions`, `QuizSessionItems`; `Vocabularies` có thêm `AudioUrl`, `Lessons` có thêm `SortOrder`.
