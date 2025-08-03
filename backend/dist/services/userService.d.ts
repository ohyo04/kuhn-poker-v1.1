import type { AuthResult } from '../types/database';
export declare function createGuestUser(): Promise<AuthResult>;
export declare function getUserById(userId: string): Promise<null>;
export declare function updateUserStats(userId: string, won: boolean): Promise<void>;
//# sourceMappingURL=userService.d.ts.map