// filepath: frontend/src/app/simulator/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type AIStrategy = 'GTO AI' | 'カスタムAI';

export default function SimulatorPage() {
  const [selectedAI1, setSelectedAI1] = useState<AIStrategy>('GTO AI');
  const [selectedAI2, setSelectedAI2] = useState<AIStrategy>('カスタムAI');
  const [simulationCount, setSimulationCount] = useState(10000);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulation = () => {
    setIsSimulating(true);
    // シミュレーション実行のロジックは後で実装
    setTimeout(() => {
      setIsSimulating(false);
    }, 3000);
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6 pt-safe">
        <Link href="/" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">AIシミュレーター</h1>
        <button className="text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        {/* AI選択セクション */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <select 
              value={selectedAI1}
              onChange={(e) => setSelectedAI1(e.target.value as AIStrategy)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value="GTO AI">GTO AI</option>
              <option value="カスタムAI">カスタムAI</option>
            </select>
            
            <span className="text-xl font-bold">VS</span>
            
            <select 
              value={selectedAI2}
              onChange={(e) => setSelectedAI2(e.target.value as AIStrategy)}
              className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600"
            >
              <option value="GTO AI">GTO AI</option>
              <option value="カスタムAI">カスタムAI</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span>対戦回数:</span>
            <div className="flex items-center space-x-2">
              <input 
                type="number"
                value={simulationCount}
                onChange={(e) => setSimulationCount(Number(e.target.value))}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 w-20 text-center"
              />
              <button 
                onClick={handleSimulation}
                disabled={isSimulating}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                {isSimulating ? '実行中...' : 'シミュレーション'}
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400 mb-4">
            {selectedAI1}のEV推移
          </div>

          {/* EV推移グラフ（プレースホルダー） */}
          <div className="bg-gray-700 rounded-lg p-4 h-32 flex items-center justify-center mb-4">
            <svg className="w-full h-full" viewBox="0 0 300 100">
              <path 
                d="M 10 80 Q 50 60 100 50 T 200 45 T 290 35" 
                stroke="#8b5cf6" 
                strokeWidth="2" 
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* GTO AI 戦略詳細 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">GTO AI</h3>
            <span className="text-purple-400 text-sm">詳細 &gt;</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">ベット頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">コール頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '45%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">ブラフ頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">フォールド頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '25%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* カスタムAI 戦略詳細 */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">カスタムAI</h3>
            <span className="text-purple-400 text-sm">詳細 &gt;</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">ベット頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">コール頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">ブラフ頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '55%'}}></div>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">フォールド頻度</span>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}