// frontend/src/app/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { connect } from 'socket.io-client';
import Link from 'next/link';
import OpponentArea from '@/components/OpponentArea';
import TableArea from '@/components/TableArea';
import PlayerArea from '@/components/PlayerArea';
import ActionControls from '@/components/ActionControls';
import GameStats from '@/components/GameStats';

// ゲーム状態の型定義（バックエンドと同じ）
interface GameState {
  playerCard: string;
  opponentCard: string;
  pot: number;
  playerChips: number;
  opponentChips: number;
  betAmount: number;
  wins: number;
  losses: number;
  ev: number;
  gamePhase: string;
  currentPlayer: 'player' | 'opponent';
  gameStage: 'betting' | 'showdown' | 'gameOver';
  playerAction: string | null;
  opponentAction: string | null;
  isGameActive: boolean;
  showOpponentCard: boolean;
  waitingForOpponent: boolean;
  gameMode?: 'ai' | 'online';
  player1Id?: string;
  player2Id?: string;
}

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [socket, setSocket] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [message, setMessage] = useState('サーバーに接続中...');
  const [gameMode, setGameMode] = useState<'ai' | 'online' | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // Socket.IO接続の初期化
  useEffect(() => {
    // roomIdが'ai-room'の場合は自動的にAI対戦モードに設定
    if (roomId === 'ai-room') {
      setGameMode('ai');
      setIsGameStarted(true);
      setMessage('');
      // AI対戦の初期化処理（サーバー接続なしでデモ用）
      initializeAIGame();
      return;
    }

    // その他のroomIdの場合は既存のSocket.IO処理
    const newSocket = connect('http://localhost:3001');
    setSocket(newSocket);

    // game-start イベントを受信（オンライン対戦用）
    newSocket.on('game-start', ({ roomId: gameRoomId, gameState: newGameState }: { roomId: string, gameState: GameState }) => {
      console.log('Game started in room:', gameRoomId);
      setGameState(newGameState);
      setIsGameStarted(true);
      setMessage('');
    });

    // ゲーム状態更新の受信
    newSocket.on('game-state-update', (newGameState: GameState) => {
      console.log('Game state received:', newGameState);
      setGameState(newGameState);
      setIsGameStarted(true);
      setMessage('');
    });

    // 待機メッセージ
    newSocket.on('waiting-for-opponent', (msg: string) => {
      console.log('Waiting message:', msg);
      setMessage(msg);
      setIsGameStarted(false);
    });

    // マッチング成功
    newSocket.on('match-found', (msg: string) => {
      console.log('Match found:', msg);
      setMessage(msg);
    });

    // 相手切断
    newSocket.on('opponent-disconnected', (msg: string) => {
      console.log('Opponent disconnected:', msg);
      setMessage(msg);
      setGameState(null);
      setIsGameStarted(false);
    });

    // 接続エラーハンドリング
    newSocket.on('connect_error', (error: any) => {
      console.error('接続エラー:', error);
      setMessage("サーバーに接続できません");
    });

    return () => {
      newSocket?.close();
    };
  }, [roomId]);

  // AI対戦の初期化処理（デモ用）
  const initializeAIGame = () => {
    setGameState({
      playerCard: 'K', // デモ用固定カード
      opponentCard: 'Q', // AIのカード（非表示）
      pot: 2,
      playerChips: 99,
      opponentChips: 99,
      betAmount: 1,
      wins: 0,
      losses: 0,
      ev: 0,
      gamePhase: 'betting',
      currentPlayer: 'player',
      gameStage: 'betting',
      playerAction: null,
      opponentAction: null,
      isGameActive: true,
      showOpponentCard: false,
      waitingForOpponent: false,
      gameMode: 'ai'
    });
  };

  // ゲームモード選択
  const selectGameMode = (mode: 'ai' | 'online') => {
    console.log('Game mode selected:', mode);
    setGameMode(mode);
    setMessage(mode === 'online' ? '対戦相手を探しています...' : 'AI対戦を準備中...');
    if (socket) {
      socket.emit('select-game-mode', mode);
    }
  };

  // プレイヤーアクション送信関数
  const sendPlayerAction = (action: string) => {
    console.log('Sending player action:', action);
    
    // AI対戦の場合はローカルで処理（デモ用）
    if (gameMode === 'ai' && roomId === 'ai-room') {
      handleAIGameAction(action);
      return;
    }

    // オンライン対戦の場合
    if (socket && gameState && gameState.isGameActive) {
      if (gameMode === 'online') {
        socket.emit('player-action', { roomId, action });
      } else if (gameMode === 'ai') {
        socket.emit('player-action', action);
      }
    } else {
      console.log('Cannot send action - socket or game state invalid');
    }
  };

  // AI対戦のアクション処理（デモ用）
  const handleAIGameAction = (action: string) => {
    if (!gameState) return;

    // プレイヤーのアクション処理
    let newGameState = { ...gameState };
    newGameState.playerAction = action;

    if (action === 'fold') {
      newGameState.losses += 1;
      newGameState.opponentChips += newGameState.pot;
      newGameState.pot = 0;
      newGameState.gamePhase = 'gameOver';
      newGameState.showOpponentCard = true;
    } else if (action === 'bet' || action === 'call') {
      newGameState.playerChips -= newGameState.betAmount;
      newGameState.pot += newGameState.betAmount;
      
      // AIの簡単な戦略（デモ用）
      const aiAction = Math.random() > 0.5 ? 'call' : 'fold';
      newGameState.opponentAction = aiAction;
      
      if (aiAction === 'call') {
        newGameState.opponentChips -= newGameState.betAmount;
        newGameState.pot += newGameState.betAmount;
        newGameState.gamePhase = 'showdown';
        newGameState.showOpponentCard = true;
        
        // 勝敗判定（簡易版）
        const playerCard = newGameState.playerCard;
        const aiCard = newGameState.opponentCard;
        const cardValues = { 'A': 3, 'K': 2, 'Q': 1 };
        
        if (cardValues[playerCard as keyof typeof cardValues] > cardValues[aiCard as keyof typeof cardValues]) {
          newGameState.wins += 1;
          newGameState.playerChips += newGameState.pot;
        } else {
          newGameState.losses += 1;
          newGameState.opponentChips += newGameState.pot;
        }
        newGameState.pot = 0;
      } else {
        newGameState.wins += 1;
        newGameState.playerChips += newGameState.pot;
        newGameState.pot = 0;
        newGameState.gamePhase = 'gameOver';
        newGameState.showOpponentCard = true;
      }
    }

    setGameState(newGameState);

    // 3秒後に新しいゲームを開始
    if (newGameState.gamePhase === 'gameOver' || newGameState.gamePhase === 'showdown') {
      setTimeout(() => {
        startNewAIGame();
      }, 3000);
    }
  };

  // 新しいAIゲームを開始
  const startNewAIGame = () => {
    const cards = ['A', 'K', 'Q'];
    const playerCard = cards[Math.floor(Math.random() * 3)];
    const aiCard = cards[Math.floor(Math.random() * 3)];
    
    setGameState(prev => ({
      ...prev!,
      playerCard,
      opponentCard: aiCard,
      pot: 2,
      gamePhase: 'betting',
      currentPlayer: 'player',
      gameStage: 'betting',
      playerAction: null,
      opponentAction: null,
      isGameActive: true,
      showOpponentCard: false,
      waitingForOpponent: false
    }));
  };

  // 新しいゲーム開始
  const startNewGame = () => {
    if (socket) {
      socket.emit('start-new-game');
    }
  };

  // ゲームモードをリセット
  const resetGameMode = () => {
    setGameMode(null);
    setGameState(null);
    setIsGameStarted(false);
    setMessage('サーバーに接続中...');
  };

  // アクションハンドラー
  const handleBet = () => sendPlayerAction('bet');
  const handleCheck = () => sendPlayerAction('check');
  const handleCall = () => sendPlayerAction('call');
  const handleFold = () => sendPlayerAction('fold');

  // AI対戦の場合は、ゲームモード選択をスキップ
  if (roomId === 'ai-room') {
    // ゲーム画面を直接表示
    if (!gameState) {
      return (
        <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto flex flex-col justify-center items-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">AI対戦を準備中...</h2>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto"></div>
          </div>
        </main>
      );
    }

    return (
      <main className="
        bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto
        flex flex-col justify-center items-center p-4
        pt-safe pb-safe relative
      ">
        
        {/* 戻るボタン（左上） */}
        <Link href="/" className="absolute top-4 left-4 p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        {/* ゲームモード表示 */}
        <div className="absolute top-4 right-4 text-sm text-gray-400">
          AI対戦
        </div>

        {/* 上部エリア */}
        <div className="w-full space-y-4 mb-6">
          <GameStats wins={gameState.wins} losses={gameState.losses} ev={gameState.ev} />
          <OpponentArea 
            name="AI" 
            chips={gameState.opponentChips}
            card={gameState.showOpponentCard ? gameState.opponentCard : null}
          />
        </div>

        {/* 中央エリア - 基準点 */}
        <div>
          <TableArea pot={gameState.pot} />
        </div>

        {/* 下部エリア */}
        <div className="w-full space-y-4 mt-6">
          <PlayerArea 
            card={gameState.playerCard} 
            name="あなた" 
            chips={gameState.playerChips} 
          />
          <ActionControls 
            betAmount={gameState.betAmount} 
            gamePhase={gameState.gamePhase}
            onBet={handleBet}
            onCheck={handleCheck}
            onCall={handleCall}
            onFold={handleFold}
            isGameActive={gameState.isGameActive}
            currentPlayer={gameState.currentPlayer}
            playerAction={gameState.playerAction}
            opponentAction={gameState.opponentAction}
            waitingForOpponent={gameState.waitingForOpponent}
          />
        </div>

        {/* ゲーム状況メッセージ */}
        {gameState.gamePhase === 'showdown' && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white rounded-lg p-4 shadow-lg z-10">
            <div className="text-center">
              {gameState.playerAction === 'fold' ? 'あなたの負け' : 
               gameState.opponentAction === 'fold' ? 'あなたの勝ち' : 
               'カードを比較中...'}
            </div>
          </div>
        )}

      </main>
    );
  }

  // 以下は既存のオンライン対戦用のコード（変更なし）
  if (!gameMode || (!isGameStarted && gameMode)) {
    return (
      <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto flex flex-col justify-center items-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold">Kuhn Poker</h1>
          
          {!gameMode && (
            <div className="space-y-4">
              <p className="text-gray-300">ゲームモードを選択してください</p>
              <div className="space-y-3">
                <button
                  onClick={() => selectGameMode('ai')}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  AI対戦
                </button>
                <button
                  onClick={() => selectGameMode('online')}
                  className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
                >
                  オンライン対戦
                </button>
              </div>
            </div>
          )}

          {gameMode && !isGameStarted && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <p className="text-gray-300">{message}</p>
              </div>
              <button
                onClick={resetGameMode}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                戻る
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ゲーム画面（オンライン対戦用）
  if (!gameState) {
    return (
      <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto flex flex-col justify-center items-center p-4">
        <div className="text-center">
          <p>ゲームデータを読み込み中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="
      bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto
      flex flex-col justify-center items-center p-4
      pt-safe pb-safe relative
    ">
      
      {/* 設定メニュー（右上） */}
      <button 
        onClick={resetGameMode}
        className="absolute top-[max(env(safe-area-inset-top,0px)+4rem,1rem)] right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </button>
      
      {/* ゲームモード表示 */}
      <div className="absolute top-4 left-4 text-sm text-gray-400">
        {gameState.gameMode === 'online' ? 'オンライン対戦' : 'AI対戦'}
      </div>

      {/* 上部エリア */}
      <div className="w-full space-y-4 mb-6">
        <GameStats wins={gameState.wins} losses={gameState.losses} ev={gameState.ev} />
        <OpponentArea 
          name={gameState.gameMode === 'online' ? '対戦相手' : '相手 (CPU)'} 
          chips={gameState.opponentChips}
          card={gameState.showOpponentCard ? gameState.opponentCard : null}
        />
      </div>

      {/* 中央エリア - 基準点 */}
      <div>
        <TableArea pot={gameState.pot} />
      </div>

      {/* 下部エリア */}
      <div className="w-full space-y-4 mt-6">
        <PlayerArea 
          card={gameState.playerCard} 
          name="あなた" 
          chips={gameState.playerChips} 
        />
        <ActionControls 
          betAmount={gameState.betAmount} 
          gamePhase={gameState.gamePhase}
          onBet={handleBet}
          onCheck={handleCheck}
          onCall={handleCall}
          onFold={handleFold}
          isGameActive={gameState.isGameActive}
          currentPlayer={gameState.currentPlayer}
          playerAction={gameState.playerAction}
          opponentAction={gameState.opponentAction}
          waitingForOpponent={gameState.waitingForOpponent}
        />
      </div>

      {/* メッセージ表示エリア */}
      {message && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white rounded-lg p-4 shadow-md z-10">
          {message}
        </div>
      )}

    </main>
  );
}