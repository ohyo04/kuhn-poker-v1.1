// frontend/src/app/page.tsx

'use client'; // useStateを使うため、クライアントコンポーネントであることを宣言します

import { useState } from 'react'; // useStateをインポート
import OpponentArea from '@/components/OpponentArea';
import TableArea from '@/components/TableArea';
import PlayerArea from '@/components/PlayerArea';
import ActionControls from '@/components/ActionControls';
import GameStats from '@/components/GameStats';

export default function GamePage() {
  // ゲームの状態をオブジェクトとして管理
  const [gameState, setGameState] = useState({
    playerCard: 'A',              // 初期カードをAに変更
    opponentCard: null as string | null,
    pot: 2,                       // 初期ポット（最初から存在）
    playerChips: 1,               // プレイヤー初期チップ1
    opponentChips: 1,             // 相手初期チップ1
    betAmount: 1,
    wins: 0,
    losses: 0,
    ev: 2.00,
    gamePhase: "あなたの番です。ベットまたはチェック。",
    currentPlayer: 'player' as 'player' | 'opponent',
    gameStage: 'betting' as 'betting' | 'showdown' | 'gameOver',
    playerAction: null as string | null,
    opponentAction: null as string | null,
    isGameActive: true,
    showOpponentCard: false,  // 相手のカード表示制御を追加
    waitingForOpponent: false // 相手の番かどうかを追加
  });

  // 新しいゲームを開始する関数
  const startNewGame = () => {
    const cards = ['A', 'K', 'Q'];  // カードをA, K, Qに変更
    
    // ランダムに2枚のカードを選ぶ（重複なし）
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const playerCard = shuffledCards[0];
    const opponentCard = shuffledCards[1];
    // 残りの1枚は使用されない（3枚目のカード）
    
    setGameState(prevState => ({
      ...prevState,
      playerCard,
      opponentCard,
      pot: 2,                     // 初期ポット2（プレイヤーからは引かない）
      playerChips: 1,             // プレイヤーチップを1にリセット
      opponentChips: 1,           // 相手チップを1にリセット
      currentPlayer: 'player' as const,
      gameStage: 'betting' as const,
      playerAction: null,
      opponentAction: null,
      isGameActive: true,
      showOpponentCard: false,  // 新ゲームでは相手のカードを隠す
      waitingForOpponent: false,
      gamePhase: "新しいゲーム開始！あなたの番です。"
    }));
  };

  // 相手のAI行動を決定する関数
  const getOpponentAction = (playerAction: string): string => {
    const random = Math.random();
    
    if (playerAction === 'bet') {
      return random > 0.5 ? 'call' : 'fold';
    } else if (playerAction === 'check') {
      return random > 0.7 ? 'bet' : 'check';
    }
    return 'check';
  };

  // ゲームの勝敗を判定する関数（Aが最強に変更）
  const determineWinner = (playerCard: string, opponentCard: string): 'player' | 'opponent' => {
    const cardValues: { [key: string]: number } = { 'A': 3, 'K': 2, 'Q': 1 };  // Aが最強
    return cardValues[playerCard] > cardValues[opponentCard] ? 'player' : 'opponent';
  };

  // ショーダウンの処理
  const resolveShowdown = () => {
    setGameState(prevState => {
      if (!prevState.opponentCard) return prevState;
      
      const winner = determineWinner(prevState.playerCard, prevState.opponentCard);
      const newState = { ...prevState };
      
      // ショーダウンでは相手のカードを表示
      newState.showOpponentCard = true;
      
      if (winner === 'player') {
        newState.playerChips += prevState.pot;
        newState.wins += 1;
        newState.gamePhase = `あなたの勝利！ ${prevState.playerCard} vs ${prevState.opponentCard}`;
      } else {
        newState.opponentChips += prevState.pot;
        newState.losses += 1;
        newState.gamePhase = `相手の勝利... ${prevState.playerCard} vs ${prevState.opponentCard}`;
      }
      
      newState.isGameActive = false;
      newState.waitingForOpponent = false;
      newState.pot = 0;
      
      // 新しいゲームを3秒後に開始
      setTimeout(() => startNewGame(), 3000);
      return newState;
    });
  };

  // 相手のアクションを処理する関数
  const handleOpponentAction = (action: string) => {
    setGameState(prevState => {
      const newState = { ...prevState };
      
      if (action === 'bet') {
        newState.pot += prevState.betAmount;
        newState.opponentChips -= prevState.betAmount;
        newState.gamePhase = "相手がベットしました。コールかフォールドを選択してください。";
        newState.currentPlayer = 'player';
        newState.waitingForOpponent = false;
      } else if (action === 'call') {
        newState.pot += prevState.betAmount;
        newState.opponentChips -= prevState.betAmount;
        newState.gamePhase = "相手がコールしました。ショーダウンです！";
        newState.gameStage = 'showdown';
        newState.waitingForOpponent = false;
        setTimeout(() => resolveShowdown(), 1000);
      } else if (action === 'fold') {
        newState.gamePhase = "相手がフォールドしました。あなたの勝利です！";
        newState.wins += 1;
        newState.isGameActive = false;
        newState.waitingForOpponent = false;
        // フォールド時は相手のカードを表示しない
        newState.showOpponentCard = false;
        setTimeout(() => startNewGame(), 2000);
      } else if (action === 'check') {
        newState.gamePhase = "相手もチェックしました。ショーダウンです！";
        newState.gameStage = 'showdown';
        newState.waitingForOpponent = false;
        setTimeout(() => resolveShowdown(), 1000);
      }
      
      newState.opponentAction = action;
      return newState;
    });
  };

  // ベットボタンがクリックされた時の処理
  const handleBet = () => {
    if (!gameState.isGameActive || gameState.playerChips < gameState.betAmount) return;
    
    setGameState(prevState => ({
      ...prevState,
      pot: prevState.pot + prevState.betAmount,
      playerChips: prevState.playerChips - prevState.betAmount,
      playerAction: 'bet',
      currentPlayer: 'opponent' as const,
      waitingForOpponent: true,
      gamePhase: "ベットしました。相手が考えています..."
    }));

    setTimeout(() => {
      const opponentAction = getOpponentAction('bet');
      handleOpponentAction(opponentAction);
    }, 1500);
  };

  // チェックボタンがクリックされた時の処理
  const handleCheck = () => {
    if (!gameState.isGameActive) return;
    
    setGameState(prevState => ({
      ...prevState,
      playerAction: 'check',
      currentPlayer: 'opponent' as const,
      waitingForOpponent: true,
      gamePhase: "チェックしました。相手が考えています..."
    }));

    setTimeout(() => {
      const opponentAction = getOpponentAction('check');
      handleOpponentAction(opponentAction);
    }, 1500);
  };

  // コールボタンがクリックされた時の処理
  const handleCall = () => {
    if (!gameState.isGameActive || gameState.playerChips < gameState.betAmount) return;
    
    setGameState(prevState => ({
      ...prevState,
      pot: prevState.pot + prevState.betAmount,
      playerChips: prevState.playerChips - prevState.betAmount,
      playerAction: 'call',
      gamePhase: "コールしました。ショーダウンです！",
      gameStage: 'showdown' as const,
      waitingForOpponent: false
    }));

    setTimeout(() => resolveShowdown(), 1000);
  };

  // フォールドボタンがクリックされた時の処理
  const handleFold = () => {
    if (!gameState.isGameActive) return;
    
    setGameState(prevState => ({
      ...prevState,
      gamePhase: "フォールドしました。相手の勝利です。",
      losses: prevState.losses + 1,
      isGameActive: false,
      waitingForOpponent: false
    }));

    setTimeout(() => startNewGame(), 2000);
  };

  return (
    <main className="
      bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto
      flex flex-col justify-center items-center p-4
      pt-safe pb-safe relative
    ">
      
      {/* 設定メニュー（右上） */}
      <button className="absolute top-[max(env(safe-area-inset-top,0px)+4rem,1rem)] right-4 p-2 hover:bg-gray-700 rounded-lg transition-colors">
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </button>
      
      {/* 上部エリア */}
      <div className="w-full space-y-4 mb-6">
        <GameStats wins={gameState.wins} losses={gameState.losses} ev={gameState.ev} />
        <OpponentArea 
          name="相手 (CPU)" 
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

    </main>
  );
}