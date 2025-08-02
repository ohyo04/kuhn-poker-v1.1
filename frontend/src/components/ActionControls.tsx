// frontend/src/components/ActionControls.tsx
import React from 'react';

interface ActionControlsProps {
  betAmount: number;
  gamePhase: string;
  onBet?: () => void;
  onCheck?: () => void;
  onCall?: () => void;
  onFold?: () => void;
  isGameActive?: boolean;
  currentPlayer?: string;
  playerAction?: string | null;
  opponentAction?: string | null;
  waitingForOpponent?: boolean;
}

export default function ActionControls({ 
  betAmount, 
  gamePhase,
  onBet,
  onCheck,
  onCall,
  onFold,
  isGameActive = true,
  currentPlayer = 'player',
  playerAction = null,
  opponentAction = null,
  waitingForOpponent = false
}: ActionControlsProps) {
  const isPlayerTurn = currentPlayer === 'player' && isGameActive && !waitingForOpponent;

  // ゲーム状況に応じて表示するボタンを決定
  const getAvailableActions = () => {
    if (!isPlayerTurn) return [];

    // 初回アクション（ベットまたはチェック）
    if (!playerAction && !opponentAction) {
      return ['bet', 'check'];
    }

    // 相手がベットした後（コールまたはフォールド）
    if (opponentAction === 'bet') {
      return ['call', 'fold'];
    }

    // 相手がチェックした後（ベットまたはチェック）
    if (opponentAction === 'check' && playerAction === 'check') {
      return [];  // ショーダウンなのでボタンなし
    }

    return ['bet', 'check'];
  };

  const availableActions = getAvailableActions();

  const renderButton = (action: string) => {
    const buttonConfig = {
      bet: {
        label: `ベット (${betAmount})`,
        className: 'bg-red-600 hover:bg-red-700',
        onClick: onBet
      },
      check: {
        label: 'チェック',
        className: 'bg-gray-600 hover:bg-gray-700',
        onClick: onCheck
      },
      call: {
        label: `コール (${betAmount})`,
        className: 'bg-blue-600 hover:bg-blue-700',
        onClick: onCall
      },
      fold: {
        label: 'フォールド',
        className: 'bg-gray-500 hover:bg-gray-600',
        onClick: onFold
      }
    };

    const config = buttonConfig[action as keyof typeof buttonConfig];
    
    return (
      <button 
        key={action}
        onClick={config.onClick}
        className={`${config.className} text-white font-bold py-3 px-4 rounded-lg transition-colors`}
      >
        {config.label}
      </button>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* ゲーム状況表示 */}
      <div className="bg-gray-800 rounded-lg p-3 text-center">
        <p className="text-sm text-gray-300">{gamePhase}</p>
      </div>

      {/* アクションボタン */}
      {availableActions.length > 0 && (
        <div className={`grid gap-3 ${availableActions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {availableActions.map(action => renderButton(action))}
        </div>
      )}

      {/* 待機中メッセージ */}
      {waitingForOpponent && (
        <div className="text-center text-gray-400 text-sm">
          相手が考えています...
        </div>
      )}
    </div>
  );
}