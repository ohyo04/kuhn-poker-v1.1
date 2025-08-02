// frontend/src/components/OpponentArea.tsx
import React from 'react';

// OpponentAreaに渡すデータの方を定義します
interface OpponentAreaProps {
  name: string;
  chips: number;
}

const OpponentArea: React.FC<OpponentAreaProps> = ({ name, chips }) => {
  return (
    // 相手プレイヤーエリア全体のコンテナ
    <div className="bg-[#3c3949] p-4 rounded-lg flex flex-col items-center space-y-2 w-[280px] mx-auto">
      {/* 名前 */}
      <p className="text-white text-base font-semibold">{name}</p>

      {/* チップ量 */}
      <p className="text-gray-300 text-sm">チップ: {chips}</p>

      {/* 伏せられたカード */}
      <div className="w-14 h-20 bg-red-500 rounded-md shadow-md">
        {/* 中身は空 */}
      </div>
    </div>
  );
};

export default OpponentArea;