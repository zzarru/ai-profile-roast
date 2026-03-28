import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '프사 심판관 | AI Profile Roast',
  description: '오늘만큼은 AI가 솔직하게 말해드립니다.',
  openGraph: {
    title: '프사 심판관',
    description: '오늘만큼은 AI가 솔직하게 말해드립니다.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
