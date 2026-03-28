'use client';

interface Props {
  resultId: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export default function ShareButtons({ resultId, cardRef }: Props) {
  async function handleCopyLink() {
    const url = `${window.location.origin}/result/${resultId}`;
    await navigator.clipboard.writeText(url);
    alert('링크 복사 완료! 친구에게 보내보세요 😈');
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = 'profile-roast.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('이미지 저장 실패. 스크린샷으로 저장해주세요!');
    }
  }

  return (
    <div className="flex gap-3 w-full">
      <button
        onClick={handleCopyLink}
        className="flex-1 border border-gray-700 text-gray-300 font-medium py-3 rounded-full hover:border-gray-500 transition-colors text-sm"
      >
        🔗 링크 복사
      </button>
      <button
        onClick={handleSaveImage}
        className="flex-1 border border-gray-700 text-gray-300 font-medium py-3 rounded-full hover:border-gray-500 transition-colors text-sm"
      >
        💾 이미지 저장
      </button>
    </div>
  );
}
