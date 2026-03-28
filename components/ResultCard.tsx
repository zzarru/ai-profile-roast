import { RoastResult } from '@/lib/types';
import { forwardRef } from 'react';

interface Props {
  result: RoastResult;
}

const ResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const isPositive = result.score >= 0;
  const scoreColor = isPositive ? '#4ade80' : '#f87171';
  const gogbackLabel =
    result.score < -500
      ? '고백각 0도 🚫'
      : result.score < 0
      ? '고백각 위험 ⚠️'
      : result.score < 50
      ? '고백각 애매 🤔'
      : result.score < 100
      ? '고백각 나왔다 📐'
      : '역고백각 주의 💘';

  return (
    <div
      ref={ref}
      style={{ aspectRatio: '1 / 1', backgroundColor: '#050505', fontFamily: 'inherit' }}
      className="relative w-full rounded-3xl overflow-hidden flex flex-col"
    >
      {/* 상단: 페르소나 + 점수 */}
      <div className="flex-none px-7 pt-7 pb-4 border-b border-gray-800">
        {/* 브랜드 */}
        <div className="text-xs text-gray-600 tracking-widest mb-3">📐 프사각</div>

        {/* 페르소나 이름 */}
        <div className="text-white font-black text-2xl leading-tight mb-4">
          {result.persona_name}
        </div>

        {/* 점수 */}
        <div className="flex items-end gap-3">
          <span
            className="font-black leading-none"
            style={{ fontSize: '4rem', color: scoreColor }}
          >
            {isPositive ? '+' : ''}{result.score.toLocaleString()}
          </span>
          <div className="pb-2">
            <div className="text-sm font-bold" style={{ color: scoreColor }}>
              {gogbackLabel}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">{result.score_label}</div>
          </div>
        </div>
      </div>

      {/* 중단: 첫인상 + 속마음 */}
      <div className="flex-1 px-7 py-4 overflow-hidden flex flex-col gap-3 min-h-0">
        {/* 첫인상 */}
        <div>
          <div className="text-xs text-gray-600 mb-1">첫인상</div>
          <div className="text-sm text-white leading-snug">
            &ldquo;{result.first_impression}&rdquo;
          </div>
        </div>

        {/* 속마음 */}
        <div className="flex-1 min-h-0">
          <div className="text-xs text-gray-600 mb-1.5">속마음</div>
          <ul className="space-y-1.5">
            {result.inner_thoughts.slice(0, 3).map((thought, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-1.5 leading-snug">
                <span className="text-gray-600 shrink-0 mt-px">{i + 1}.</span>
                <span>{thought}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 하단: 착한 말 */}
      <div className="flex-none px-7 py-4 border-t border-gray-800 bg-gray-900/40">
        <div className="text-xs text-gray-600 mb-1">그래도 해줄 말</div>
        <div className="text-xs text-gray-400 italic leading-snug">
          &ldquo;{result.kind_comment}&rdquo;
        </div>
      </div>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';
export default ResultCard;
