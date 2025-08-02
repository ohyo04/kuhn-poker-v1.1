import { describe, it, expect } from 'vitest';
import { 
  determineWinner, 
  getOpponentAction, 
  isValidCard,
  calculateInitialChips,
  calculateChipsAfterBet,
  addToPot
} from './gameLogic.js';

describe('Kuhn Poker Game Logic Tests', () => {
  describe('determineWinner', () => {
    it('should return player when player has Ace and opponent has King', () => {
      expect(determineWinner('A', 'K')).toBe('player');
    });

    it('should return player when player has Ace and opponent has Queen', () => {
      expect(determineWinner('A', 'Q')).toBe('player');
    });

    it('should return player when player has King and opponent has Queen', () => {
      expect(determineWinner('K', 'Q')).toBe('player');
    });

    it('should return opponent when opponent has higher card', () => {
      expect(determineWinner('K', 'A')).toBe('opponent');
      expect(determineWinner('Q', 'K')).toBe('opponent');
      expect(determineWinner('Q', 'A')).toBe('opponent');
    });

    it('should throw error for invalid cards', () => {
      expect(() => determineWinner('J', 'A')).toThrow('Invalid card value');
      expect(() => determineWinner('A', 'J')).toThrow('Invalid card value');
      expect(() => determineWinner('X', 'Y')).toThrow('Invalid card value');
    });
  });

  describe('getOpponentAction', () => {
    it('should return call when player bets and random > 0.5', () => {
      expect(getOpponentAction('bet', 0.6)).toBe('call');
      expect(getOpponentAction('bet', 0.9)).toBe('call');
    });

    it('should return fold when player bets and random <= 0.5', () => {
      expect(getOpponentAction('bet', 0.5)).toBe('fold');
      expect(getOpponentAction('bet', 0.3)).toBe('fold');
    });

    it('should return bet when player checks and random > 0.7', () => {
      expect(getOpponentAction('check', 0.8)).toBe('bet');
      expect(getOpponentAction('check', 0.9)).toBe('bet');
    });

    it('should return check when player checks and random <= 0.7', () => {
      expect(getOpponentAction('check', 0.7)).toBe('check');
      expect(getOpponentAction('check', 0.5)).toBe('check');
    });

    it('should return check for unknown action', () => {
      expect(getOpponentAction('unknown')).toBe('check');
      expect(getOpponentAction('invalid')).toBe('check');
    });
  });

  describe('isValidCard', () => {
    it('should return true for valid cards', () => {
      expect(isValidCard('A')).toBe(true);
      expect(isValidCard('K')).toBe(true);
      expect(isValidCard('Q')).toBe(true);
    });

    it('should return false for invalid cards', () => {
      expect(isValidCard('J')).toBe(false);
      expect(isValidCard('2')).toBe(false);
      expect(isValidCard('X')).toBe(false);
      expect(isValidCard('')).toBe(false);
    });
  });

  describe('calculateInitialChips', () => {
    it('should return correct initial chip count', () => {
      expect(calculateInitialChips()).toBe(1);
    });
  });

  describe('calculateChipsAfterBet', () => {
    it('should calculate chips correctly after bet', () => {
      expect(calculateChipsAfterBet(5, 1)).toBe(4);
      expect(calculateChipsAfterBet(10, 3)).toBe(7);
      expect(calculateChipsAfterBet(1, 1)).toBe(0);
    });

    it('should throw error when insufficient chips', () => {
      expect(() => calculateChipsAfterBet(0, 1)).toThrow('Insufficient chips');
      expect(() => calculateChipsAfterBet(2, 3)).toThrow('Insufficient chips');
    });
  });

  describe('addToPot', () => {
    it('should add bet amount to pot correctly', () => {
      expect(addToPot(2, 1)).toBe(3);
      expect(addToPot(0, 5)).toBe(5);
      expect(addToPot(10, 0)).toBe(10);
    });

    it('should throw error for negative bet amount', () => {
      expect(() => addToPot(2, -1)).toThrow('Bet amount cannot be negative');
    });
  });
});