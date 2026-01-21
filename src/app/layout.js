import "./globals.css";

export const metadata = {
  title: "꿈결 - 무의식의 예술",
  description: "어젯밤 당신의 무의식이 보낸 장면을 예술로 기록합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
