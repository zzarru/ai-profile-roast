import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '프사각',
  description: '이거 프사각?',
  openGraph: {
    title: '프사각',
    description: '이거 프사각?',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
