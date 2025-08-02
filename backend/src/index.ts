import express from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3000",
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
  gameMode?: 'ai' | 'online';
  player1Id?: string;
  player2Id?: string;
}

// ルーム管理の型定義
interface Room {
  id: string;
  players: { socketId: string, username: string }[];
  gameState: GameState | null;
  player1Stats: { wins: number, losses: number };
  player2Stats: { wins: number, losses: number };
}

// サーバー全体で管理するデータ
const rooms: Record<string, Room> = {};
let waitingPlayer: Socket | null = null;
const gameStates: Map<string, GameState> = new Map(); // AI対戦用のゲーム状態管理

// 新しいゲームを開始する関数
const startNewGame = (): GameState => {
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
    gamePhase: "ゲーム開始！あなたの番です。",
    currentPlayer: 'player',
    gameStage: 'betting',
    playerAction: null,
    opponentAction: null,
    isGameActive: true,
    showOpponentCard: false,
    waitingForOpponent: false,
    gameMode: 'online'
  };
};

// AI対戦用の新しいゲーム開始関数
const startNewAIGame = (socketId: string): GameState => {
  const gameState = startNewGame();
  gameState.gameMode = 'ai';
  gameState.gamePhase = "AI対戦開始！あなたの番です。";
  
  // 既存の勝敗記録を保持
  const existingState = gameStates.get(socketId);
  if (existingState) {
    gameState.wins = existingState.wins;
    gameState.losses = existingState.losses;
  }
  
  gameStates.set(socketId, gameState);
  return gameState;
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

// プレイヤーのゲーム状態を取得（視点に応じて調整）
const getPlayerGameState = (room: Room, playerSocketId: string): GameState | null => {
  if (!room.gameState) return null;
  
  const isPlayer1 = room.players[0]?.socketId === playerSocketId;
  const playerStats = isPlayer1 ? room.player1Stats : room.player2Stats;
  
  if (isPlayer1) {
    // Player1の視点
    return {
      ...room.gameState,
      wins: playerStats.wins,
      losses: playerStats.losses
    };
  } else {
    // Player2の視点（カードと役割を入れ替え）
    return {
      ...room.gameState,
      playerCard: room.gameState.opponentCard,
      opponentCard: room.gameState.playerCard,
      currentPlayer: room.gameState.currentPlayer === 'player' ? 'opponent' : 'player',
      wins: playerStats.wins,
      losses: playerStats.losses,
      gamePhase: room.gameState.currentPlayer === 'player' ? 
        "相手の番をお待ちください。" : 
        room.gameState.gamePhase
    };
  }
};

// オンライン対戦でのプレイヤーアクション処理
const handleOnlinePlayerAction = (socketId: string, roomId: string, action: string) => {
  const room = rooms[roomId];
  if (!room || !room.gameState) return;

  const isPlayer1 = room.players[0]?.socketId === socketId;
  const currentPlayerTurn = room.gameState.currentPlayer === 'player';
  
  // プレイヤー1のターンかプレイヤー2のターンかをチェック
  if ((isPlayer1 && !currentPlayerTurn) || (!isPlayer1 && currentPlayerTurn)) {
    console.log('Not player turn');
    return;
  }

  let gameState = { ...room.gameState };

  if (action === 'bet') {
    gameState.pot += gameState.betAmount;
    if (isPlayer1) {
      gameState.playerChips -= gameState.betAmount;
      gameState.playerAction = 'bet';
    } else {
      gameState.opponentChips -= gameState.betAmount;
      gameState.opponentAction = 'bet';
    }
    gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'opponent' : 'player';
    gameState.waitingForOpponent = !gameState.waitingForOpponent;
    gameState.gamePhase = "ベットしました。相手の番です。";

  } else if (action === 'check') {
    if (isPlayer1) {
      gameState.playerAction = 'check';
    } else {
      gameState.opponentAction = 'check';
    }
    
    // 両方がチェックした場合はショーダウン
    if (gameState.playerAction === 'check' && gameState.opponentAction === 'check') {
      gameState.gamePhase = "両者チェック。ショーダウンです！";
      gameState.gameStage = 'showdown';
      gameState.waitingForOpponent = false;
      setTimeout(() => resolveOnlineShowdown(roomId), 1000);
    } else {
      gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'opponent' : 'player';
      gameState.waitingForOpponent = !gameState.waitingForOpponent;
      gameState.gamePhase = "チェックしました。相手の番です。";
    }

  } else if (action === 'call') {
    gameState.pot += gameState.betAmount;
    if (isPlayer1) {
      gameState.playerChips -= gameState.betAmount;
      gameState.playerAction = 'call';
    } else {
      gameState.opponentChips -= gameState.betAmount;
      gameState.opponentAction = 'call';
    }
    gameState.gamePhase = "コールしました。ショーダウンです！";
    gameState.gameStage = 'showdown';
    gameState.waitingForOpponent = false;
    setTimeout(() => resolveOnlineShowdown(roomId), 1000);

  } else if (action === 'fold') {
    gameState.gamePhase = "フォールドしました。";
    gameState.isGameActive = false;
    gameState.waitingForOpponent = false;
    
    // 勝敗を記録
    if (isPlayer1) {
      room.player1Stats.losses += 1;
      room.player2Stats.wins += 1;
    } else {
      room.player2Stats.losses += 1;
      room.player1Stats.wins += 1;
    }
    
    setTimeout(() => startNewOnlineGame(roomId), 3000);
  }

  // ゲーム状態を更新
  room.gameState = gameState;

  // 両プレイヤーに更新された状態を送信
  const player1State = getPlayerGameState(room, room.players[0]!.socketId);
  const player2State = getPlayerGameState(room, room.players[1]!.socketId);
  
  io.to(room.players[0]!.socketId).emit('game-state-update', player1State);
  io.to(room.players[1]!.socketId).emit('game-state-update', player2State);
};

// オンライン対戦でのショーダウン処理
const resolveOnlineShowdown = (roomId: string) => {
  const room = rooms[roomId];
  if (!room || !room.gameState) return;

  const winner = determineWinner(room.gameState.playerCard, room.gameState.opponentCard);
  let gameState = { ...room.gameState };

  gameState.showOpponentCard = true;

  if (winner === 'player') {
    gameState.playerChips += gameState.pot;
    room.player1Stats.wins += 1;
    room.player2Stats.losses += 1;
    gameState.gamePhase = `Player1の勝利！ ${gameState.playerCard} vs ${gameState.opponentCard}`;
  } else {
    gameState.opponentChips += gameState.pot;
    room.player1Stats.losses += 1;
    room.player2Stats.wins += 1;
    gameState.gamePhase = `Player2の勝利！ ${gameState.opponentCard} vs ${gameState.playerCard}`;
  }

  gameState.isGameActive = false;
  gameState.waitingForOpponent = false;
  gameState.pot = 0;

  room.gameState = gameState;

  // 両プレイヤーに結果を送信
  const player1State = getPlayerGameState(room, room.players[0]!.socketId);
  const player2State = getPlayerGameState(room, room.players[1]!.socketId);
  
  io.to(room.players[0]!.socketId).emit('game-state-update', player1State);
  io.to(room.players[1]!.socketId).emit('game-state-update', player2State);

  setTimeout(() => startNewOnlineGame(roomId), 3000);
};

// オンライン対戦で新しいゲームを開始
const startNewOnlineGame = (roomId: string) => {
  const room = rooms[roomId];
  if (!room) return;

  room.gameState = startNewGame();

  const player1State = getPlayerGameState(room, room.players[0]!.socketId);
  const player2State = getPlayerGameState(room, room.players[1]!.socketId);

  io.to(room.players[0]!.socketId).emit('game-state-update', player1State);
  io.to(room.players[1]!.socketId).emit('game-state-update', player2State);
};

// AI対戦でのプレイヤーアクション処理
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
    io.to(socketId).emit('game-state-update', updatedState);

    setTimeout(() => {
      const opponentAction = getOpponentAction('bet');
      handleAIOpponentAction(socketId, opponentAction);
    }, 1500);

  } else if (action === 'check') {
    updatedState.playerAction = 'check';
    updatedState.currentPlayer = 'opponent';
    updatedState.waitingForOpponent = true;
    updatedState.gamePhase = "チェックしました。相手が考えています...";

    gameStates.set(socketId, updatedState);
    io.to(socketId).emit('game-state-update', updatedState);

    setTimeout(() => {
      const opponentAction = getOpponentAction('check');
      handleAIOpponentAction(socketId, opponentAction);
    }, 1500);

  } else if (action === 'call') {
    updatedState.pot += gameState.betAmount;
    updatedState.playerChips -= gameState.betAmount;
    updatedState.playerAction = 'call';
    updatedState.gamePhase = "コールしました。ショーダウンです！";
    updatedState.gameStage = 'showdown';
    updatedState.waitingForOpponent = false;

    gameStates.set(socketId, updatedState);
    io.to(socketId).emit('game-state-update', updatedState);

    setTimeout(() => resolveAIShowdown(socketId), 1000);

  } else if (action === 'fold') {
    updatedState.gamePhase = "フォールドしました。相手の勝利です。";
    updatedState.losses += 1;
    updatedState.isGameActive = false;
    updatedState.waitingForOpponent = false;

    gameStates.set(socketId, updatedState);
    io.to(socketId).emit('game-state-update', updatedState);

    setTimeout(() => {
      const newGameState = startNewAIGame(socketId);
      io.to(socketId).emit('game-state-update', newGameState);
    }, 2000);
  }
};

// 相手のアクションを処理する関数（AI対戦用）
const handleAIOpponentAction = (socketId: string, action: string) => {
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
    setTimeout(() => resolveAIShowdown(socketId), 1000);
  } else if (action === 'fold') {
    updatedState.gamePhase = "相手がフォールドしました。あなたの勝利です！";
    updatedState.wins += 1;
    updatedState.isGameActive = false;
    updatedState.waitingForOpponent = false;
    updatedState.showOpponentCard = false;
    setTimeout(() => {
      const newGameState = startNewAIGame(socketId);
      io.to(socketId).emit('game-state-update', newGameState);
    }, 2000);
  } else if (action === 'check') {
    updatedState.gamePhase = "相手もチェックしました。ショーダウンです！";
    updatedState.gameStage = 'showdown';
    updatedState.waitingForOpponent = false;
    setTimeout(() => resolveAIShowdown(socketId), 1000);
  }

  updatedState.opponentAction = action;
  gameStates.set(socketId, updatedState);
  io.to(socketId).emit('game-state-update', updatedState);
};

// ショーダウンの処理（AI対戦用）
const resolveAIShowdown = (socketId: string) => {
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
  io.to(socketId).emit('game-state-update', updatedState);

  // 新しいゲームを3秒後に開始
  setTimeout(() => {
    const newGameState = startNewAIGame(socketId);
    io.to(socketId).emit('game-state-update', newGameState);
  }, 3000);
};

// 接続があったときの処理
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('select-game-mode', (mode: 'ai' | 'online') => {
    console.log(`Game mode selected: ${mode} by ${socket.id}`);
    
    if (mode === 'ai') {
      // AI対戦モード
      const gameState = startNewAIGame(socket.id);
      socket.emit('game-state-update', gameState);
    } else if (mode === 'online') {
      // オンライン対戦モード（複数ルーム管理）
      if (waitingPlayer && waitingPlayer.id !== socket.id) {
        // 2人揃ったので、新しいルームを作成
        const roomId = uuidv4();
        const room: Room = {
          id: roomId,
          players: [
            { socketId: waitingPlayer.id, username: 'Player 1' },
            { socketId: socket.id, username: 'Player 2' }
          ],
          gameState: null,
          player1Stats: { wins: 0, losses: 0 },
          player2Stats: { wins: 0, losses: 0 }
        };
        rooms[roomId] = room;

        // 両プレイヤーを同じルームに参加させる
        waitingPlayer.join(roomId);
        socket.join(roomId);

        console.log(`Room ${roomId} created with players ${room.players.map(p => p.socketId).join(', ')}`);

        // ゲームを開始
        room.gameState = startNewGame();
        
        // それぞれの視点でゲーム状態を送信
        const player1State = getPlayerGameState(room, waitingPlayer.id);
        const player2State = getPlayerGameState(room, socket.id);
        
        io.to(waitingPlayer.id).emit('game-start', { roomId, gameState: player1State });
        io.to(socket.id).emit('game-start', { roomId, gameState: player2State });

        // 待機プレイヤーをリセット
        waitingPlayer = null;
      } else {
        // 誰も待っていなければ、自分が待機
        waitingPlayer = socket;
        socket.emit('waiting-for-opponent', '対戦相手を探しています...');
      }
    }
  });

  // プレイヤーアクション処理
  socket.on('player-action', (data: { roomId?: string, action: string } | string) => {
    if (typeof data === 'string') {
      // AI対戦の場合（従来の形式）
      handleAIPlayerAction(socket.id, data);
    } else {
      // オンライン対戦の場合
      const { roomId, action } = data;
      if (roomId) {
        handleOnlinePlayerAction(socket.id, roomId, action);
      } else {
        // roomIdがないがオブジェクト形式の場合はAI対戦として扱う
        handleAIPlayerAction(socket.id, action);
      }
    }
  });

  // 切断したときの処理
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    
    // AI対戦のゲーム状態を削除
    gameStates.delete(socket.id);
    
    // 待機中だったらリセット
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
      return;
    }

    // ゲーム中のルームからプレイヤーを削除
    for (const [roomId, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        // 相手に切断を通知
        const remainingPlayers = room.players.filter(p => p.socketId !== socket.id);
        if (remainingPlayers.length > 0) {
          const remainingPlayer = remainingPlayers[0];
          if (remainingPlayer) {
            io.to(remainingPlayer.socketId).emit('opponent-disconnected', '相手が切断しました');
          }
        }
        
        // ルームを削除
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted due to player disconnect`);
        break;
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});