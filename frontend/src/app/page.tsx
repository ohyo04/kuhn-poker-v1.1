// frontend/src/app/page.tsx

import OpponentArea from '@/components/OpponentArea';
import TableArea from '@/components/TableArea';
import PlayerArea from '@/components/PlayerArea';
import ActionControls from '@/components/ActionControls';
import GameStats from '@/components/GameStats';

export default function GamePage() {
  return (
    <main className="bg-[#2d2a3a] text-white min-h-screen max-w-[390px] mx-auto flex flex-col p-4">
      {/* 上部：統計情報 */}
      <div className="mb-4">
        <GameStats wins={0} losses={0} ev={2.00} />
      </div>

      {/* 中央上部：相手プレイヤーエリア */}
      <div className="flex-1 flex items-start justify-center pt-8">
        <OpponentArea name="相手 (CPU)" chips={1} />
      </div>

      {/* 中央：テーブルエリア */}
      <div className="flex justify-center my-8">
        <TableArea pot={2} />
      </div>

      {/* 下部：プレイヤーエリア & アクションボタン */}
      <div className="flex-1 flex flex-col justify-end items-center pb-8">
        <div className="space-y-4">
          <PlayerArea card="A" name="あなた" chips={1} />
          <ActionControls betAmount={1} gamePhase="あなたの番です。ベットまたはチェック。" />
        </div>
      </div>
    </main>
  );
}