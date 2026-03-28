import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">📐</div>
      <h1 className="text-4xl font-black mb-3 tracking-tight">
        프사각
      </h1>
      <p className="text-gray-400 text-lg mb-2">
        이거 프사각?
      </p>
      <p className="text-gray-600 text-sm mb-10">
        내 프로필 사진, 그 사람한테 통할까?
      </p>
      <Link
        href="/persona"
        className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors"
      >
        각도 재기 →
      </Link>
      <p className="mt-6 text-xs text-gray-700">
        📐 고백각 측정 서비스
      </p>
    </main>
  );
}
