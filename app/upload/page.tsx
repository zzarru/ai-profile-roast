'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, saveSession } from '@/lib/store';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [imageMediaType, setImageMediaType] = useState('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleFile(file: File) {
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
    setImageMediaType(mediaType);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  async function handleSubmit() {
    const session = getSession();
    if (!session.personaName || !imageBase64) return;

    setLoading(true);
    setError('');

    router.push('/analyzing');

    try {
      saveSession({ imageBase64, imageMediaType });

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          imageMediaType,
          personaName: session.personaName,
          personaDescription: session.personaDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/result/${data.id}`);
    } catch (e) {
      setError('분석에 실패했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">사진 업로드</h1>
      <p className="text-gray-400 text-sm mb-6">
        판결받을 프로필 사진을 올려주세요
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-700 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-500 transition-colors"
        style={{ minHeight: 280 }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" style={{ minHeight: 280 }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-600">
            <div className="text-5xl mb-3">📸</div>
            <p className="text-sm">클릭하거나 사진을 드래그하세요</p>
            <p className="text-xs mt-1">JPG, PNG, WEBP 지원</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!imageBase64 || loading}
        className="w-full mt-6 bg-white text-black font-bold py-4 rounded-full disabled:opacity-30 hover:bg-gray-200 transition-colors"
      >
        {loading ? '분석 중...' : '판결 받기 ⚖️'}
      </button>
    </main>
  );
}
