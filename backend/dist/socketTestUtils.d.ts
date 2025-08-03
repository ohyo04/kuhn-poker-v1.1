import { Server } from 'socket.io';
export declare const startTestServer: () => Promise<{
    server: Server;
    port: number;
}>;
export declare const createTestClient: (port: number) => null;
//# sourceMappingURL=socketTestUtils.d.ts.map