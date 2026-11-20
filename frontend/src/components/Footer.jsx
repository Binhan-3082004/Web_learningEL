import { Link } from "react-router-dom";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const STUDY_LINKS = [
  { label: "Bài học", to: "/lessons" },
  { label: "Quiz từ vựng", to: "/quiz" },
  { label: "Thi thử", to: "/exams" },
  { label: "Tiến độ", to: "/progress" },
];

const SUPPORT_LINKS = [
  { label: "Câu hỏi thường gặp", to: "/faq" },
  { label: "Liên hệ", to: "/contact" },
  { label: "Điều khoản sử dụng", to: "/terms" },
  { label: "Chính sách bảo mật", to: "/privacy" },
];

const BOTTOM_LINKS = [
  { label: "Điều khoản", to: "/terms" },
  { label: "Bảo mật", to: "/privacy" },
  { label: "Liên hệ", to: "/contact" },
];

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white text-gray-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-blue-300 hover:text-blue-600"
    >
      {children}
    </a>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-[#f9faef] px-4 pb-8 pt-10">
      <div className="mx-auto w-full max-w-7xl">
     
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#e3e7ff] px-7 py-6 md:flex-row md:items-center md:gap-6">
          <div>
            <h2 className="text-[19px] font-bold leading-snug text-gray-900">
              Bắt đầu học tiếng Anh{" "}
              <span className="text-[#2f5ef7]">ngay hôm nay</span>
            </h2>
            <p className="mt-1 text-[13px] text-gray-600">
              Đăng ký miễn phí để lưu tiến độ và làm bài thi thử.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/quiz"
              className="flex h-[46px] items-center rounded-xl bg-[#d6f357] px-3.5 transition hover:brightness-95"
            >
              <span className="mr-2.5 text-[22px] font-extrabold leading-none text-gray-900">
                Aa
              </span>
              <span className="text-left text-[11px] leading-[1.25] text-gray-800">
                <strong className="block font-bold">Quiz từ vựng</strong>
                <span className="block">Luyện nhớ mỗi ngày</span>
              </span>
            </Link>

            <Link
              to="/register"
              className="flex h-[46px] items-center rounded-xl bg-[#2557f5] px-5 text-[13px] font-bold text-white transition hover:bg-blue-700"
            >
              Đăng ký miễn phí <span className="ml-2 text-base">→</span>
            </Link>
          </div>
        </div>

      
        <div className="grid grid-cols-1 gap-10 py-11 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
         
          <div>
            <Link
              to="/"
              className="flex items-center gap-2.5 text-[15px] font-bold text-gray-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#2557f5] text-xs font-bold text-white">
                En
              </span>
              English Learning
            </Link>
            <p className="mt-4 max-w-[250px] text-[13px] leading-relaxed text-gray-600">
              Học từ vựng và ngữ pháp theo từng cấp độ A1–C2. Bài học, luyện tập
              và theo dõi tiến độ trong cùng một nơi.
            </p>
            <div className="mt-5 flex gap-2.5">
              <SocialIcon label="Facebook" href="https://facebook.com">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V3.9c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H7.3v3H10v8h3.5Z" />
                </svg>
              </SocialIcon>

              <SocialIcon label="YouTube" href="https://youtube.com">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
                </svg>
              </SocialIcon>

              <SocialIcon label="Email" href="mailto:support@englishlearning.vn">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          <FooterColumn title="Học tập">
            <div className="space-y-3 text-[13px] text-gray-600">
              {STUDY_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block transition-colors hover:text-[#2557f5]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </FooterColumn>

          <FooterColumn title="Cấp độ">
            <div className="grid max-w-[180px] grid-cols-3 gap-2">
              {LEVELS.map((level) => (
                <Link
                  key={level}
                  to={`/lessons?level=${level}`}
                  className="flex h-8 items-center justify-center rounded-lg bg-[#eef1f6] text-xs font-bold text-gray-800 transition hover:bg-[#dfe5f7] hover:text-[#2557f5]"
                >
                  {level}
                </Link>
              ))}
            </div>
          </FooterColumn>

        
          <FooterColumn title="Hỗ trợ">
            <div className="space-y-3 text-[13px] text-gray-600">
              {SUPPORT_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="block transition-colors hover:text-[#2557f5]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </FooterColumn>
        </div>

    
        <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-300/70 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} English Learning. Học tiếng Anh trực
            tuyến mỗi ngày.
          </p>
          <div className="flex items-center gap-6">
            {BOTTOM_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="transition-colors hover:text-[#2557f5]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}