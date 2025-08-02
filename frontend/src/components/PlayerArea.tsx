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
    // プレイヤーエリア全体のコンテナ
    <div className="bg-[#3c3949] p-4 rounded-lg flex flex-col items-center space-y-2 w-[280px] mx-auto">
      {/* カード */}
      <div className="w-14 h-20 bg-white rounded-md flex items-center justify-center shadow-md border border-gray-200">
        <span className="text-black text-xl font-bold">
          {card}
        </span>
      </div>

      {/* 名前 */}
      <p className="text-white text-base font-semibold">{name}</p>

      {/* チップ量 */}
      <p className="text-gray-300 text-sm">チップ: {chips}</p>
    </div>
  );
};

export default PlayerArea;