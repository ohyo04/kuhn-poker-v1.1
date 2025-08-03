'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RandomMatchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [playerRating] = useState(1580);

  const startSearch = () => {
    setIsSearching(true);
    // マッチング処理は後で実装
  };

  const cancelSearch = () => {
    setIsSearching(false);
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8 pt-safe">
        {/* ここを /select から / に変更 */}
        <Link href="/" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">ランダムマッチ</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-8 mt-16">
        {/* レーティング表示 */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-dashed border-purple-500 flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">あなたのレート</div>
              <div className="text-4xl font-bold">{playerRating}</div>
            </div>
          </div>
        </div>

        {/* ステータステキスト */}
        <div className="text-center">
          <p className="text-gray-300">
            {isSearching ? '対戦相手を検索中...' : '対戦相手を探しますか？'}
          </p>
        </div>

        {/* アクションボタン */}
        <div className="w-full max-w-xs">
          {!isSearching ? (
            <button
              onClick={startSearch}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              マッチング開始
            </button>
          ) : (
            <button
              onClick={cancelSearch}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    </main>
  );
}