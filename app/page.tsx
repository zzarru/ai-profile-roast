import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">⚖️</div>
      <h1 className="text-4xl font-black mb-3 tracking-tight">
        프사 심판관
      </h1>
      <p className="text-gray-400 text-lg mb-2">
        오늘만큼은 AI가 솔직하게 말해드립니다.
      </p>
      <p className="text-gray-600 text-sm mb-10">
        당신의 프로필 사진, 진짜 첫인상은 어떨까요?
      </p>
      <Link
        href="/persona"
        className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors"
      >
        판결 시작하기 →
      </Link>
      <p className="mt-6 text-xs text-gray-700">
        ⚠️ 상처받을 준비가 된 분만 클릭하세요
      </p>
    </main>
  );
}
