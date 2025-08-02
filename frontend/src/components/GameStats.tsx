
// frontend/src/components/GameStats.tsx
import React from 'react';

interface GameStatsProps {
  wins: number;
  losses: number;
  ev: number;
}

const GameStats: React.FC<GameStatsProps> = ({ wins, losses, ev }) => {
  return (
    <div className="bg-gray-800 rounded-full flex divide-x divide-gray-600 w-full">
      <div className="flex-1 text-center py-2 px-2">
        <p className="text-white text-sm font-bold">{wins} 勝利</p>
      </div>
      <div className="flex-1 text-center py-2 px-2">
        <p className="text-white text-sm font-bold">{losses} 敗北</p>
      </div>
      <div className="flex-1 text-center py-2 px-2">
        <p className="text-white text-sm font-bold">{ev.toFixed(2)} EV</p>
      </div>
    </div>
  );
};

export default GameStats;
