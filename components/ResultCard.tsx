import { RoastResult } from '@/lib/types';
import { forwardRef } from 'react';

interface Props {
  result: RoastResult;
}

const ResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const scoreColor =
    result.score < 0
      ? 'text-red-400'
      : result.score < 50
      ? 'text-yellow-400'
      : 'text-green-400';

  return (
    <div
      ref={ref}
      className="bg-gray-950 border border-gray-800 rounded-3xl p-6 w-full"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-600 tracking-widest uppercase">
          AI Profile Roast
        </span>
      </div>

      {/* 페르소나 */}
      <div className="text-xs text-gray-500 mb-1">심판관</div>
      <div className="font-bold text-base mb-5">{result.persona_name}</div>

      {/* 점수 */}
      <div className="text-xs text-gray-500 mb-1">호감도 점수</div>
      <div className={`text-5xl font-black mb-1 ${scoreColor}`}>
        {result.score.toLocaleString()}점
      </div>
      <div className="text-sm text-gray-500 mb-5">{result.score_label}</div>

      {/* 첫인상 */}
      <div className="text-xs text-gray-500 mb-1">첫인상</div>
      <div className="text-sm text-white mb-5 leading-relaxed">
        &ldquo;{result.first_impression}&rdquo;
      </div>

      {/* 속마음 */}
      <div className="text-xs text-gray-500 mb-2">😈 솔직한 속마음</div>
      <ul className="space-y-2 mb-5">
        {result.inner_thoughts.map((thought, i) => (
          <li key={i} className="text-sm text-gray-300 flex gap-2">
            <span className="text-gray-600 shrink-0">{i + 1}.</span>
            <span>{thought}</span>
          </li>
        ))}
      </ul>

      {/* 착한 말 */}
      <div className="border-t border-gray-800 pt-4">
        <div className="text-xs text-gray-500 mb-1">😇 실제로 해줄 말</div>
        <div className="text-sm text-gray-400 italic">&ldquo;{result.kind_comment}&rdquo;</div>
      </div>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';
export default ResultCard;
