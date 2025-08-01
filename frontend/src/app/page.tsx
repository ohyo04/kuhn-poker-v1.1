// frontend/src/app/page.tsx

import OpponentArea from '@/components/OpponentArea';
import TableArea from '@/components/TableArea';
import PlayerArea from '@/components/PlayerArea';
import ActionControls from '@/components/ActionControls';

export default function GamePage() {
  return (
    <main className="bg-gray-800 text-white min-h-screen flex flex-col items-center justify-between p-8">
      {/* 相手プレイヤーエリア */}
      <OpponentArea />

      {/* テーブル中央エリア */}
      <TableArea />

      {/* 自分プレイヤーエリア & アクションボタン */}
      <div className="w-full">
        <PlayerArea />
        <ActionControls />
      </div>
    </main>
  );
}