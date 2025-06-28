"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
// Handle messages from the main thread
worker_threads_1.parentPort?.on('message', async (message) => {
    try {
        // Process the message based on its type
        switch (message.type) {
            case 'process':
                // Add your processing logic here
                const result = await processTask(message.data);
                worker_threads_1.parentPort?.postMessage({ type: 'result', data: result });
                break;
            default:
                worker_threads_1.parentPort?.postMessage({
                    type: 'error',
                    error: `Unknown message type: ${message.type}`
                });
        }
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
async function processTask(data) {
    // Add your task processing logic here
    return {
        status: 'success',
        result: `Processed: ${JSON.stringify(data)}`
    };
}
// Error handling for the worker
process.on('uncaughtException', (error) => {
    worker_threads_1.parentPort?.postMessage({
        type: 'error',
        error: `Uncaught Exception: ${error.message}`
    });
});
process.on('unhandledRejection', (reason) => {
    worker_threads_1.parentPort?.postMessage({
        type: 'error',
        error: `Unhandled Rejection: ${reason}`
    });
});
//# sourceMappingURL=index.js.map