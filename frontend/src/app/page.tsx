'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto flex flex-col justify-center items-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-orange-400 mb-8">Kuhn Poker</h1>
        
        <div className="w-full space-y-4">
          {/* AI対戦 - 既存のゲーム機能へ */}
          <Link href="/game/ai-room">
            <button className="w-full bg-orange-600 hover:bg-orange-700 border-2 border-orange-500 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              AI対戦
            </button>
          </Link>

          {/* ランダムマッチ */}
          <Link href="/random">
            <button className="w-full bg-green-600 hover:bg-green-700 border-2 border-green-500 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              ランダムマッチ
            </button>
          </Link>

          {/* フレンド対戦 */}
          <Link 
            href="/friend" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
          >
            フレンド対戦
          </Link>

          {/* 統計 */}
          <Link href="/stats">
            <button className="w-full bg-gray-600 hover:bg-gray-700 border-2 border-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              統計
            </button>
          </Link>

          {/* AIシミュレーター */}
          <Link href="/simulator">
            <button className="w-full bg-gray-600 hover:bg-gray-700 border-2 border-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-colors">
              AIシミュレーター
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}