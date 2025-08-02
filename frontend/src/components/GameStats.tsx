// frontend/src/components/GameStats.tsx
import React from 'react';

interface GameStatsProps {
  wins: number;
  losses: number;
  ev: number;
}

const GameStats: React.FC<GameStatsProps> = ({ wins, losses, ev }) => {
  return (
    <div className="bg-[#2d2a3a] rounded-lg p-2 w-[350px] mx-auto">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#3c3949] rounded-md py-2 px-2">
          <p className="text-white text-base font-bold">{wins}</p>
          <p className="text-gray-300 text-xs">勝利</p>
        </div>
        <div className="bg-[#3c3949] rounded-md py-2 px-2">
          <p className="text-white text-base font-bold">{losses}</p>
          <p className="text-gray-300 text-xs">敗北</p>
        </div>
        <div className="bg-[#3c3949] rounded-md py-2 px-2">
          <p className="text-white text-base font-bold">{ev.toFixed(2)}</p>
          <p className="text-gray-300 text-xs">EV</p>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
