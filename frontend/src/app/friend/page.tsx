'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { connect } from 'socket.io-client';

export default function FriendMatchPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  const [inputRoomCode, setInputRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const newSocket = connect('http://localhost:3001');
    setSocket(newSocket);

    // ルーム作成成功
    newSocket.on('room-created', (data: { roomCode: string; message: string }) => {
      setRoomCode(data.roomCode);
      setMessage(data.message);
      setIsCreating(false);
    });

    // ルーム参加成功
    newSocket.on('room-joined', (data: { roomCode: string; message: string }) => {
      setMessage(data.message);
      setIsJoining(false);
    });

    // プレイヤー参加通知
    newSocket.on('player-joined', () => {
      setMessage('相手が参加しました！ゲームを開始します...');
    });

    // フレンド対戦ゲーム開始
    newSocket.on('friend-game-start', (data: { roomId: string; gameState: any }) => {
      router.push(`/game/${data.roomId}`);
    });

    // エラーハンドリング
    newSocket.on('room-error', (data: { message: string }) => {
      setMessage(`エラー: ${data.message}`);
      setIsCreating(false);
      setIsJoining(false);
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  const createRoom = () => {
    if (!socket) return;
    
    setIsCreating(true);
    setMessage('ルームを作成中...');
    
    // 仮のユーザーID（後で認証システムと統合）
    const userId = `user_${Date.now()}`;
    socket.emit('create-friend-room', { userId });
  };

  const joinRoom = () => {
    if (!socket || !inputRoomCode.trim()) return;
    
    setIsJoining(true);
    setMessage('ルームに参加中...');
    
    // 仮のユーザーID（後で認証システムと統合）
    const userId = `user_${Date.now()}`;
    socket.emit('join-friend-room', { 
      roomCode: inputRoomCode.toUpperCase(),
      userId 
    });
  };

  return (
    <main className="bg-gray-900 text-white min-h-screen max-w-[390px] mx-auto p-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8 pt-safe">
        <Link href="/" className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">フレンド対戦</h1>
        <div className="w-6"></div>
      </div>

      <div className="space-y-8">
        {/* ルーム作成セクション */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">ルームを作成</h2>
          
          {roomCode ? (
            <div className="text-center space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">ルームコード</p>
                <p className="text-3xl font-bold tracking-wider">{roomCode}</p>
              </div>
              <p className="text-sm text-gray-400">
                このコードを友達に伝えて参加してもらってください
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(roomCode)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                コードをコピー
              </button>
            </div>
          ) : (
            <button
              onClick={createRoom}
              disabled={isCreating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isCreating ? 'ルーム作成中...' : 'ルームを作成'}
            </button>
          )}
        </div>

        {/* ルーム参加セクション */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">ルームに参加</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                ルームコード
              </label>
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                placeholder="6桁のコードを入力"
                maxLength={6}
                className="w-full bg-gray-700 text-white text-center text-xl tracking-wider rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            
            <button
              onClick={joinRoom}
              disabled={isJoining || inputRoomCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isJoining ? 'ルームに参加中...' : 'ルームに参加'}
            </button>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-center text-gray-300">{message}</p>
          </div>
        )}
      </div>
    </main>
  );
}