import type { CreateUserData, AuthResult } from '../types/database';

// Prismaクライアントが生成されるまでの仮実装
export async function createGuestUser(): Promise<AuthResult> {
  const guestUsername = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  // 仮実装（実際のデータベース保存は後で追加）
  const user = {
    id: `user_${Date.now()}`,
    username: guestUsername,
    rating: 1500,
    wins: 0,
    losses: 0,
    totalGames: 0,
  };
  
  const token = `token_${user.id}`;
  
  return { user, token };
}

export async function getUserById(userId: string) {
  // 仮実装
  return null;
}

export async function updateUserStats(userId: string, won: boolean) {
  // 仮実装
  console.log(`User ${userId} ${won ? 'won' : 'lost'}`);
}