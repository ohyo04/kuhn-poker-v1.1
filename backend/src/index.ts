import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

const app = express();
const server = http.createServer(app);

// Socket.IOサーバーを初期化
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000", // フロントエンドのURLを許可
    methods: ["GET", "POST"]
  }
});

const port = 3001;

// ゲーム状態の型定義
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
  // オンライン対戦用の新しいフィールド（オプショナルに変更）
  gameMode?: 'ai' | 'online';
  player1Id?: string;
  player2Id?: string;
}

// ★★★ マルチプレイヤー管理用の変数を追加 ★★★
let waitingPlayers: string[] = [];
let activeGames = new Map<string, {
  player1: string;
  player2: string;
  gameState: GameState;
}>();

// ゲーム状態管理（各プレイヤーごとに状態を保持）
const gameStates = new Map<string, GameState>();

// 新しいゲームを開始する関数（オンライン対戦用に拡張）
const startNewGame = (socketId: string, gameMode: 'ai' | 'online' = 'ai', opponentId?: string): GameState => {
  const cards = ['A', 'K', 'Q'];
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
  
  const playerCard = shuffledCards[0];
  const opponentCard = shuffledCards[1];
  
  if (!playerCard || !opponentCard) {
    throw new Error('カードの配布でエラーが発生しました');
  }

  const newGameState: GameState = {
    playerCard,
    opponentCard,
    pot: 2,
    playerChips: 1,
    opponentChips: 1,
    betAmount: 1,
    wins: gameStates.get(socketId)?.wins || 0,
    losses: gameStates.get(socketId)?.losses || 0,
    ev: 2.00,
    gamePhase: gameMode === 'online' ? "オンライン対戦開始！" : "新しいゲーム開始！あなたの番です。",
    currentPlayer: 'player',
    gameStage: 'betting',
    playerAction: null,
    opponentAction: null,
    isGameActive: true,
    showOpponentCard: false,
    waitingForOpponent: false,
    gameMode,
    player1Id: socketId
  };

  // player2Idは条件付きで追加
  if (opponentId) {
    newGameState.player2Id = opponentId;
  }

  gameStates.set(socketId, newGameState);
  return newGameState;
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

// ゲームの勝敗を判定する関数
const determineWinner = (playerCard: string, opponentCard: string): 'player' | 'opponent' => {
  const cardValues: { [key: string]: number } = { 'A': 3, 'K': 2, 'Q': 1 };
  const playerValue = cardValues[playerCard];
  const opponentValue = cardValues[opponentCard];
  
  if (playerValue === undefined || opponentValue === undefined) {
    throw new Error('Invalid card value');
  }
  
  return playerValue > opponentValue ? 'player' : 'opponent';
};

// オンラインゲーム作成
const createOnlineGame = (player1Id: string, player2Id: string): GameState => {
  const cards = ['A', 'K', 'Q'];
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
  
  const playerCard = shuffledCards[0];
  const opponentCard = shuffledCards[1];
  
  if (!playerCard || !opponentCard) {
    throw new Error('カードの配布でエラーが発生しました');
  }
  
  return {
    playerCard,
    opponentCard,
    pot: 2,
    playerChips: 1,
    opponentChips: 1,
    betAmount: 1,
    wins: 0,
    losses: 0,
    ev: 2.00,
    gamePhase: "オンライン対戦開始！",
    currentPlayer: 'player',
    gameStage: 'betting',
    playerAction: null,
    opponentAction: null,
    isGameActive: true,
    showOpponentCard: false,
    waitingForOpponent: false,
    gameMode: 'online',
    player1Id,
    player2Id
  };
};

// 接続があったときの処理
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // ゲームモード選択のイベントを追加
  socket.on('select-game-mode', (mode: 'ai' | 'online') => {
    console.log(`Game mode selected: ${mode} by ${socket.id}`);
    
    if (mode === 'ai') {
      // AI対戦モード（従来通り）
      const gameState = startNewGame(socket.id, 'ai');
      socket.emit('game-state-update', gameState);
    } else if (mode === 'online') {
      // オンライン対戦モード
      handleOnlineMatchmaking(socket.id);
    }
  });

  // オンライン対戦のマッチメイキング処理
  const handleOnlineMatchmaking = (socketId: string) => {
    if (waitingPlayers.length === 0) {
      // 待機中のプレイヤーがいない場合
      waitingPlayers.push(socketId);
      socket.emit('waiting-for-opponent', '対戦相手を探しています...');
      console.log('Player waiting:', socketId);
    } else {
      // 待機中のプレイヤーがいる場合、マッチング成立
      const player1Id = waitingPlayers.shift()!;
      const player2Id = socketId;
      
      // ゲームルームを作成
      const gameId = `game_${Date.now()}`;
      const gameState = createOnlineGame(player1Id, player2Id);
      
      activeGames.set(gameId, {
        player1: player1Id,
        player2: player2Id,
        gameState
      });

      // 両プレイヤーのゲーム状態を個別管理
      gameStates.set(player1Id, { ...gameState });
      gameStates.set(player2Id, { 
        ...gameState,
        playerCard: gameState.opponentCard,
        opponentCard: gameState.playerCard,
        currentPlayer: 'opponent',
        gamePhase: "オンライン対戦開始！相手の番をお待ちください。"
      });

      // 両プレイヤーをルームに参加させる
      io.sockets.sockets.get(player1Id)?.join(gameId);
      io.sockets.sockets.get(player2Id)?.join(gameId);

      // 両プレイヤーにゲーム開始を通知
      io.to(gameId).emit('match-found', '対戦相手が見つかりました！');
      
      // プレイヤー1の視点でゲーム状態を送信
      io.to(player1Id).emit('game-state-update', gameStates.get(player1Id));
      
      // プレイヤー2の視点でゲーム状態を送信
      io.to(player2Id).emit('game-state-update', gameStates.get(player2Id));

      console.log('Match created:', { gameId, player1Id, player2Id });
    }
  };

  // 新しいゲーム開始
  socket.on('start-new-game', () => {
    const gameState = startNewGame(socket.id);
    socket.emit('game-state-update', gameState);
  });

  // プレイヤーアクション処理（オンライン対戦にも対応）
  socket.on('player-action', (action: string) => {
    console.log(`Player action: ${action} from ${socket.id}`);
    
    const gameState = gameStates.get(socket.id);
    if (!gameState || !gameState.isGameActive) {
      console.log('Game state invalid or inactive');
      return;
    }

    // オンライン対戦の場合とAI対戦の場合で分岐
    if (gameState.gameMode === 'online') {
      handleOnlinePlayerAction(socket.id, action);
    } else {
      handleAIPlayerAction(socket.id, action);
    }
  });

  // AI対戦でのプレイヤーアクション処理（既存のロジック）
  const handleAIPlayerAction = (socketId: string, action: string) => {
    const gameState = gameStates.get(socketId);
    if (!gameState) return;

    let updatedState = { ...gameState };

    if (action === 'bet') {
      updatedState.pot += gameState.betAmount;
      updatedState.playerChips -= gameState.betAmount;
      updatedState.playerAction = 'bet';
      updatedState.currentPlayer = 'opponent';
      updatedState.waitingForOpponent = true;
      updatedState.gamePhase = "ベットしました。相手が考えています...";

      gameStates.set(socketId, updatedState);
      socket.emit('game-state-update', updatedState);

      setTimeout(() => {
        const opponentAction = getOpponentAction('bet');
        handleOpponentAction(socketId, opponentAction);
      }, 1500);

    } else if (action === 'check') {
      updatedState.playerAction = 'check';
      updatedState.currentPlayer = 'opponent';
      updatedState.waitingForOpponent = true;
      updatedState.gamePhase = "チェックしました。相手が考えています...";

      gameStates.set(socketId, updatedState);
      socket.emit('game-state-update', updatedState);

      setTimeout(() => {
        const opponentAction = getOpponentAction('check');
        handleOpponentAction(socketId, opponentAction);
      }, 1500);

    } else if (action === 'call') {
      updatedState.pot += gameState.betAmount;
      updatedState.playerChips -= gameState.betAmount;
      updatedState.playerAction = 'call';
      updatedState.gamePhase = "コールしました。ショーダウンです！";
      updatedState.gameStage = 'showdown';
      updatedState.waitingForOpponent = false;

      gameStates.set(socketId, updatedState);
      socket.emit('game-state-update', updatedState);

      setTimeout(() => resolveShowdown(socketId), 1000);

    } else if (action === 'fold') {
      updatedState.gamePhase = "フォールドしました。相手の勝利です。";
      updatedState.losses += 1;
      updatedState.isGameActive = false;
      updatedState.waitingForOpponent = false;

      gameStates.set(socketId, updatedState);
      socket.emit('game-state-update', updatedState);

      setTimeout(() => {
        const newGameState = startNewGame(socketId);
        socket.emit('game-state-update', newGameState);
      }, 2000);
    }
  };

  // 相手のアクションを処理する関数（AI対戦用）
  const handleOpponentAction = (socketId: string, action: string) => {
    const gameState = gameStates.get(socketId);
    if (!gameState) return;

    let updatedState = { ...gameState };

    if (action === 'bet') {
      updatedState.pot += gameState.betAmount;
      updatedState.opponentChips -= gameState.betAmount;
      updatedState.gamePhase = "相手がベットしました。コールかフォールドを選択してください。";
      updatedState.currentPlayer = 'player';
      updatedState.waitingForOpponent = false;
    } else if (action === 'call') {
      updatedState.pot += gameState.betAmount;
      updatedState.opponentChips -= gameState.betAmount;
      updatedState.gamePhase = "相手がコールしました。ショーダウンです！";
      updatedState.gameStage = 'showdown';
      updatedState.waitingForOpponent = false;
      setTimeout(() => resolveShowdown(socketId), 1000);
    } else if (action === 'fold') {
      updatedState.gamePhase = "相手がフォールドしました。あなたの勝利です！";
      updatedState.wins += 1;
      updatedState.isGameActive = false;
      updatedState.waitingForOpponent = false;
      updatedState.showOpponentCard = false;
      setTimeout(() => {
        const newGameState = startNewGame(socketId);
        socket.emit('game-state-update', newGameState);
      }, 2000);
    } else if (action === 'check') {
      updatedState.gamePhase = "相手もチェックしました。ショーダウンです！";
      updatedState.gameStage = 'showdown';
      updatedState.waitingForOpponent = false;
      setTimeout(() => resolveShowdown(socketId), 1000);
    }

    updatedState.opponentAction = action;
    gameStates.set(socketId, updatedState);
    socket.emit('game-state-update', updatedState);
  };

  // ショーダウンの処理（AI対戦用）
  const resolveShowdown = (socketId: string) => {
    const gameState = gameStates.get(socketId);
    if (!gameState) return;

    const winner = determineWinner(gameState.playerCard, gameState.opponentCard);
    let updatedState = { ...gameState };

    updatedState.showOpponentCard = true;

    if (winner === 'player') {
      updatedState.playerChips += gameState.pot;
      updatedState.wins += 1;
      updatedState.gamePhase = `あなたの勝利！ ${gameState.playerCard} vs ${gameState.opponentCard}`;
    } else {
      updatedState.opponentChips += gameState.pot;
      updatedState.losses += 1;
      updatedState.gamePhase = `相手の勝利... ${gameState.playerCard} vs ${gameState.opponentCard}`;
    }

    updatedState.isGameActive = false;
    updatedState.waitingForOpponent = false;
    updatedState.pot = 0;

    gameStates.set(socketId, updatedState);
    socket.emit('game-state-update', updatedState);

    // 新しいゲームを3秒後に開始
    setTimeout(() => {
      const newGameState = startNewGame(socketId);
      socket.emit('game-state-update', newGameState);
    }, 3000);
  };

  // オンライン対戦でのプレイヤーアクション処理
  const handleOnlinePlayerAction = (socketId: string, action: string) => {
    console.log('Handling online player action:', action, 'from', socketId);
    
    // アクティブなゲームを探す
    let currentGameId: string | null = null;
    let gameData: any = null;
    
    for (const [gameId, game] of activeGames.entries()) {
      if (game.player1 === socketId || game.player2 === socketId) {
        currentGameId = gameId;
        gameData = game;
        break;
      }
    }
    
    if (!currentGameId || !gameData) {
      console.log('No active game found for player:', socketId);
      return;
    }
    
    const isPlayer1 = gameData.player1 === socketId;
    const opponentId = isPlayer1 ? gameData.player2 : gameData.player1;
    
    // 現在のプレイヤーのゲーム状態を取得
    const playerGameState = gameStates.get(socketId);
    const opponentGameState = gameStates.get(opponentId);
    
    if (!playerGameState || !opponentGameState) {
      console.log('Game states not found');
      return;
    }
    
    // プレイヤーの番でない場合は無視
    if (playerGameState.currentPlayer !== 'player') {
      console.log('Not player turn');
      return;
    }
    
    let updatedPlayerState = { ...playerGameState };
    let updatedOpponentState = { ...opponentGameState };
    
    if (action === 'bet') {
      // プレイヤーがベット
      updatedPlayerState.pot += playerGameState.betAmount;
      updatedPlayerState.playerChips -= playerGameState.betAmount;
      updatedPlayerState.playerAction = 'bet';
      updatedPlayerState.currentPlayer = 'opponent';
      updatedPlayerState.waitingForOpponent = true;
      updatedPlayerState.gamePhase = "ベットしました。相手の番です。";
      
      // 相手側の状態更新
      updatedOpponentState.pot += playerGameState.betAmount;
      updatedOpponentState.opponentChips -= playerGameState.betAmount;
      updatedOpponentState.opponentAction = 'bet';
      updatedOpponentState.currentPlayer = 'player';
      updatedOpponentState.waitingForOpponent = false;
      updatedOpponentState.gamePhase = "相手がベットしました。コールかフォールドを選択してください。";
      
    } else if (action === 'check') {
      // プレイヤーがチェック
      updatedPlayerState.playerAction = 'check';
      updatedPlayerState.currentPlayer = 'opponent';
      updatedPlayerState.waitingForOpponent = true;
      updatedPlayerState.gamePhase = "チェックしました。相手の番です。";
      
      // 相手側の状態更新
      updatedOpponentState.opponentAction = 'check';
      updatedOpponentState.currentPlayer = 'player';
      updatedOpponentState.waitingForOpponent = false;
      updatedOpponentState.gamePhase = "相手がチェックしました。あなたの番です。";
      
    } else if (action === 'call') {
      // プレイヤーがコール
      updatedPlayerState.pot += playerGameState.betAmount;
      updatedPlayerState.playerChips -= playerGameState.betAmount;
      updatedPlayerState.playerAction = 'call';
      updatedPlayerState.gamePhase = "コールしました。ショーダウンです！";
      updatedPlayerState.gameStage = 'showdown';
      updatedPlayerState.waitingForOpponent = false;
      
      // 相手側の状態更新
      updatedOpponentState.pot += playerGameState.betAmount;
      updatedOpponentState.opponentChips -= playerGameState.betAmount;
      updatedOpponentState.opponentAction = 'call';
      updatedOpponentState.gamePhase = "相手がコールしました。ショーダウンです！";
      updatedOpponentState.gameStage = 'showdown';
      updatedOpponentState.waitingForOpponent = false;
      
      // ショーダウンの処理
      setTimeout(() => resolveOnlineShowdown(currentGameId!), 1000);
      
    } else if (action === 'fold') {
      // プレイヤーがフォールド
      updatedPlayerState.gamePhase = "フォールドしました。相手の勝利です。";
      updatedPlayerState.losses += 1;
      updatedPlayerState.isGameActive = false;
      updatedPlayerState.waitingForOpponent = false;
      
      // 相手側の状態更新
      updatedOpponentState.gamePhase = "相手がフォールドしました。あなたの勝利です！";
      updatedOpponentState.wins += 1;
      updatedOpponentState.isGameActive = false;
      updatedOpponentState.waitingForOpponent = false;
      
      // 3秒後に新しいゲームを開始
      setTimeout(() => startNewOnlineGame(currentGameId!), 3000);
    }
    
    // 状態を更新
    gameStates.set(socketId, updatedPlayerState);
    gameStates.set(opponentId, updatedOpponentState);
    
    // アクティブゲームの状態も更新
    gameData.gameState = updatedPlayerState;
    activeGames.set(currentGameId, gameData);
    
    // 両プレイヤーに更新された状態を送信
    io.to(socketId).emit('game-state-update', updatedPlayerState);
    io.to(opponentId).emit('game-state-update', updatedOpponentState);
    
    console.log('Game states updated for both players');
  };
  
  // オンライン対戦でのショーダウン処理
  const resolveOnlineShowdown = (gameId: string) => {
    const gameData = activeGames.get(gameId);
    if (!gameData) return;
    
    const player1State = gameStates.get(gameData.player1);
    const player2State = gameStates.get(gameData.player2);
    
    if (!player1State || !player2State) return;
    
    // 勝者を決定（プレイヤー1の視点から）
    const winner = determineWinner(player1State.playerCard, player1State.opponentCard);
    
    let updatedPlayer1State = { ...player1State };
    let updatedPlayer2State = { ...player2State };
    
    // 両方にカードを表示
    updatedPlayer1State.showOpponentCard = true;
    updatedPlayer2State.showOpponentCard = true;
    
    if (winner === 'player') {
      // プレイヤー1の勝利
      updatedPlayer1State.playerChips += player1State.pot;
      updatedPlayer1State.wins += 1;
      updatedPlayer1State.gamePhase = `あなたの勝利！ ${player1State.playerCard} vs ${player1State.opponentCard}`;
      
      updatedPlayer2State.opponentChips += player2State.pot;
      updatedPlayer2State.losses += 1;
      updatedPlayer2State.gamePhase = `相手の勝利... ${player2State.playerCard} vs ${player2State.opponentCard}`;
    } else {
      // プレイヤー2の勝利
      updatedPlayer1State.opponentChips += player1State.pot;
      updatedPlayer1State.losses += 1;
      updatedPlayer1State.gamePhase = `相手の勝利... ${player1State.playerCard} vs ${player1State.opponentCard}`;
      
      updatedPlayer2State.playerChips += player2State.pot;
      updatedPlayer2State.wins += 1;
      updatedPlayer2State.gamePhase = `あなたの勝利！ ${player2State.playerCard} vs ${player2State.opponentCard}`;
    }
    
    updatedPlayer1State.isGameActive = false;
    updatedPlayer1State.waitingForOpponent = false;
    updatedPlayer1State.pot = 0;
    
    updatedPlayer2State.isGameActive = false;
    updatedPlayer2State.waitingForOpponent = false;
    updatedPlayer2State.pot = 0;
    
    // 状態を更新して送信
    gameStates.set(gameData.player1, updatedPlayer1State);
    gameStates.set(gameData.player2, updatedPlayer2State);
    
    io.to(gameData.player1).emit('game-state-update', updatedPlayer1State);
    io.to(gameData.player2).emit('game-state-update', updatedPlayer2State);
    
    // 新しいゲームを3秒後に開始
    setTimeout(() => startNewOnlineGame(gameId), 3000);
  };
  
  // オンライン対戦で新しいゲームを開始
  const startNewOnlineGame = (gameId: string) => {
    const gameData = activeGames.get(gameId);
    if (!gameData) return;
    
    const newGameState = createOnlineGame(gameData.player1, gameData.player2);
    
    // プレイヤー1の状態
    const player1State = {
      ...newGameState,
      wins: gameStates.get(gameData.player1)?.wins || 0,
      losses: gameStates.get(gameData.player1)?.losses || 0,
      gamePhase: "新しいゲーム開始！あなたが先攻です。"
    };
    
    // プレイヤー2の状態
    const player2State = {
      ...newGameState,
      playerCard: newGameState.opponentCard,
      opponentCard: newGameState.playerCard,
      currentPlayer: 'opponent' as const,
      wins: gameStates.get(gameData.player2)?.wins || 0,
      losses: gameStates.get(gameData.player2)?.losses || 0,
      gamePhase: "新しいゲーム開始！相手の番をお待ちください。"
    };
    
    gameStates.set(gameData.player1, player1State);
    gameStates.set(gameData.player2, player2State);
    
    gameData.gameState = newGameState;
    activeGames.set(gameId, gameData);
    
    io.to(gameData.player1).emit('game-state-update', player1State);
    io.to(gameData.player2).emit('game-state-update', player2State);
    
    console.log('New online game started for:', gameId);
  };

  // 切断したときの処理
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    
    // 待機リストから削除
    waitingPlayers = waitingPlayers.filter(id => id !== socket.id);
    
    // アクティブなゲームから削除
    for (const [gameId, game] of activeGames.entries()) {
      if (game.player1 === socket.id || game.player2 === socket.id) {
        activeGames.delete(gameId);
        // 相手に切断を通知
        const opponentId = game.player1 === socket.id ? game.player2 : game.player1;
        io.to(opponentId).emit('opponent-disconnected', '相手が切断しました');
        break;
      }
    }
    
    gameStates.delete(socket.id);
  });
});

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});