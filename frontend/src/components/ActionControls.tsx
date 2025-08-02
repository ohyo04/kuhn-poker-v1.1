// frontend/src/components/ActionControls.tsx
import React from 'react';

interface ActionControlsProps {
  betAmount: number;
  gamePhase?: string;
}

const ActionControls: React.FC<ActionControlsProps> = ({ betAmount, gamePhase = "あなたの番です。ベットまたはチェック。" }) => {
  return (
    <div className="space-y-3 w-[350px] mx-auto">
      {/* ゲームフェーズメッセージ */}
      <div className="text-center bg-[#2d2a3a] rounded-lg py-3 px-4">
        <p className="text-gray-300 text-sm">{gamePhase}</p>
      </div>
      
      {/* アクションボタン */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-4 rounded-full shadow-lg transition-colors text-sm">
          ベット ({betAmount})
        </button>
        <button className="bg-[#5a5668] hover:bg-[#6b667d] text-white font-bold py-4 px-4 rounded-full shadow-lg transition-colors text-sm">
          チェック
        </button>
      </div>
    </div>
  );
};

export default ActionControls;