// frontend/src/components/OpponentArea.tsx
import React from 'react';

// OpponentAreaに渡すデータの方を定義します
interface OpponentAreaProps {
  name: string;
  chips: number;
  card?: string | null;
}

export default function OpponentArea({ name, chips, card }: OpponentAreaProps) {
  return (
    // プレイヤーと同じスタイルに統一
    <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center space-y-2 w-full max-w-sm mx-auto">
      {/* カード */}
      <div className="w-14 h-20 rounded-xl flex items-center justify-center shadow-md">
        {card ? (
          // ショーダウン時：実際のカードを表示（プレイヤーと同じ白背景）
          <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
            <span className="text-black text-2xl font-bold">{card}</span>
          </div>
        ) : (
          // 通常時：裏向きカードを表示（赤いカード背面）
          <div className="w-full h-full bg-red-500 rounded-xl flex items-center justify-center">
            <div className="w-full h-full relative overflow-hidden rounded-xl">
              <div className="w-full h-full bg-red-500"></div>
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 名前 */}
      <p className="text-white text-base font-semibold">{name}</p>

      {/* チップ量 - プレイヤーと同じスタイル */}
      <p className="text-gray-400 text-sm">チップ: {chips}</p>
    </div>
  );
}