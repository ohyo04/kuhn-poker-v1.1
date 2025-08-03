import { Server } from 'socket.io';
import { createServer } from 'http';
export const startTestServer = () => {
    const httpServer = createServer();
    const io = new Server(httpServer);
    return new Promise((resolve) => {
        httpServer.listen(() => {
            const address = httpServer.address();
            resolve({ server: io, port: address.port });
        });
    });
};
export const createTestClient = (port) => {
    // テストクライアントの簡易実装
    return null;
};
//# sourceMappingURL=socketTestUtils.js.map