'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: string;
  ev: number;
  playstyle: {
    betWithA: number;
    betWithK: number;
    betWithQ: number;
    callWithA: number;
    callWithK: number;
    callWithQ: number;
  };
}

export default function StatsPage() {
  // ダミーデータ（実際のデータは後で接続）
  const [stats] = useState<GameStats>({
    totalGames: 1234,
    wins: 652,
    losses: 582,
    winRate: '52.8',
    ev: 128.5,
    playstyle: {
      betWithA: 75,
      betWithK: 45,
      betWithQ: 25,
      callWithA: 90,
      callWithK: 65,
      callWithQ: 35
    }
  });

  return (
    <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6 pt-safe">
        <Link href="/" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">統計</h1>
        <div className="w-6"></div>
      </div>

      <div className="space-y-6">
        {/* 統計データカード */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            統計データ
            <button className="text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{stats.totalGames.toLocaleString()}</div>
              <div className="text-sm text-gray-400">総ゲーム数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
              <div className="text-sm text-gray-400">勝率</div>
            </div>
            <div>
              <div className="text-xl font-bold text-orange-400">+{stats.ev}</div>
              <div className="text-sm text-gray-400">総収益</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">0.104</div>
              <div className="text-sm text-gray-400">EV/Game</div>
            </div>
          </div>
        </div>

        {/* プレイスタイル分析 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">あなたのプレイスタイル分析</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Aを持った時のベット率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Kを持った時のベット率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Qでのブラフベット率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">ベットへのコール率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Aでコールする率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Kでコールする率:</span>
              <span className="text-sm font-bold">---%</span>
            </div>
          </div>
        </div>

        {/* ゲーム履歴 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">ゲーム履歴</h3>
            <button className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="text-center text-gray-400 py-8">
            ゲーム履歴を表示する準備中...
          </div>
        </div>
      </div>
    </main>
  );
}