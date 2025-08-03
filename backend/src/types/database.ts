// Prismaクライアントが生成されるまでの一時的な型定義

// 基本的なデータベース型（手動定義）
export interface User {
  id: string;
  username: string;
  rating: number;
  totalGames: number;
  wins: number;
  losses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Game {
  id: string;
  roomId: string;
  gameMode: string;
  status: string;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  gameData?: any;
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
}

export interface GameStats {
  id: string;
  userId: string;
  betWithA: number;
  betWithK: number;
  betWithQ: number;
  callWithA: number;
  callWithK: number;
  callWithQ: number;
  foldWithA: number;
  foldWithK: number;
  foldWithQ: number;
  timesHadA: number;
  timesHadK: number;
  timesHadQ: number;
  updatedAt: Date;
}

export interface Room {
  id: string;
  roomCode: string;
  creatorId?: string;
  status: string;
  gameMode: string;
  createdAt: Date;
  expiresAt: Date;
}

// 既存のGameStateインターフェースを拡張
export interface ExtendedGameState {
  // 既存のGameStateプロパティ
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
  
  // データベース関連のプロパティ
  gameId?: string;
  player1Id?: string;
  player2Id?: string;
}

// ユーザー関連の型
export interface UserWithStats extends User {
  gameStats?: GameStats[];
}

// 認証関連の型
export interface AuthResult {
  user: {
    id: string;
    username: string;
    rating: number;
    wins: number;
    losses: number;
    totalGames: number;
  };
  token: string;
}

export interface CreateUserData {
  username: string;
  email?: string;
  password?: string;
}