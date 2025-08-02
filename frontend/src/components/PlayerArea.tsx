// frontend/src/components/PlayerArea.tsx
import React from 'react';

// コンポーネントに渡すデータの方を定義します
interface PlayerAreaProps {
  card: string | null;
  name: string;
  chips: number;
}

const PlayerArea: React.FC<PlayerAreaProps> = ({ card, name, chips }) => {
  return (
    // bg-gray-800, rounded-2xl に変更
    <div className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center space-y-2 w-full max-w-sm mx-auto">
      {/* カード: rounded-xl に変更 */}
      <div className="w-14 h-20 bg-white rounded-xl flex items-center justify-center shadow-md">
        <span className="text-black text-2xl font-bold">
          {card}
        </span>
      </div>

      {/* 名前 */}
      <p className="text-white text-base font-semibold">{name}</p>

      {/* チップ量 */}
      <p className="text-gray-400 text-sm">チップ: {chips}</p>
    </div>
  );
};

export default PlayerArea;