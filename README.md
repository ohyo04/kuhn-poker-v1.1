# Kuhn Poker v1.1

A web-based implementation of Kuhn Poker game with complete game logic and AI opponent.

## 🎮 Game Features

- **Complete Game Flow**: Betting → AI opponent action → Showdown → New game
- **Proper Card Distribution**: A, K, Q cards with no duplicates per game
- **Smart UI Controls**: Context-aware button display based on game state
- **Card Visibility Management**: Face-down cards → Showdown reveal → Reset
- **Basic AI Opponent**: Simple computer player with random decision-making
- **Real-time Statistics**: Win/loss tracking and game statistics
- **Mobile-Optimized**: Responsive design for smartphone gameplay

## 🏆 Implementation Status

### ✅ Phase 1: Static UI Implementation (Completed)
- Modern development environment (Next.js + TypeScript + Tailwind CSS)
- Complete Figma design reproduction
- Component-based UI architecture
- Mobile-responsive layout

### 🚧 Phase 2: Game Logic and State Management (In Progress)
- ✅ React useState-based state management
- ✅ Complete game flow implementation
- ✅ Basic AI opponent integration
- ✅ Correct Kuhn Poker rules implementation
- ✅ Dynamic UI/UX improvements
- 🔄 **AI Strategy Enhancement** (Next: Implement optimal/smart strategies)
- 🔄 **Advanced Game Mechanics** (Next: More sophisticated decision-making)

## 🎯 Game Rules

Kuhn Poker is a simplified poker game with the following rules:

- **Cards**: 3 cards total (A > K > Q in strength)
- **Players**: 2 players (human vs AI)
- **Distribution**: Each player gets 1 card, 1 card remains unused
- **Initial Setup**: 
  - Pot starts with 2 chips (not deducted from players)
  - Each player starts with 1 chip per game
  - Betting amount: 1 chip
- **Actions**: Bet, Check, Call, Fold
- **Winning**: Higher card wins in showdown, or opponent folds

## 🤖 Current AI Status

### ✅ Implemented:
- Basic random decision-making
- Proper game flow responses
- Action timing simulation

### 🔄 In Development:
- **Optimal Strategy Implementation**: Nash equilibrium-based decisions
- **Card-aware Strategy**: Decisions based on card strength
- **Bluffing Logic**: Strategic deception mechanisms
- **Adaptive Difficulty**: Player skill-based AI adjustment

## 🚀 Project Structure

- `frontend/` - Next.js frontend application with complete game implementation
- `backend/` - Node.js/TypeScript backend server (future multiplayer support)

## 🛠 Getting Started

### Frontend (Main Game)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Optional)
```bash
cd backend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## 🔧 Technologies Used

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hooks
- **Backend**: Node.js, TypeScript
- **State Management**: React useState
- **UI Components**: Custom React components
- **Styling**: Tailwind CSS with mobile-first approach

## 📱 Game Screenshots

The game features a clean, modern interface optimized for mobile devices with:
- Player and opponent card areas
- Central pot display
- Dynamic action buttons
- Real-time game statistics
- Smooth game flow transitions

## 🎯 Key Technical Achievements

1. **Proper Game Logic**: Correct implementation of Kuhn Poker rules
2. **State Management**: Comprehensive React state management
3. **Component Architecture**: Reusable, maintainable UI components
4. **User Experience**: Intuitive, responsive game interface
5. **Basic AI Integration**: Functional computer opponent (basic level)

## 🔮 Next Steps & Future Enhancements

### Phase 2 Completion:
- **Smart AI Strategies**: Implement game theory optimal play
- **Advanced Decision Trees**: Context-aware AI responses
- **Strategy Variations**: Multiple AI difficulty levels

### Phase 3 & Beyond:
- Enhanced animation effects
- Sound effects and audio feedback
- Multiplayer support
- Advanced statistics and analytics
- Tournament mode
- Machine learning-based AI

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**🎮 Version 1.1 Status**: Core game mechanics complete, basic AI functional, advanced AI strategies in development.
