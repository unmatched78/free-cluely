import { parentPort } from 'worker_threads';

// Define message types
interface WorkerMessage {
  type: string;
  data?: any;
}

interface ResultMessage {
  type: 'result';
  data: any;
}

interface ErrorMessage {
  type: 'error';
  error: string;
}

type WorkerResponse = ResultMessage | ErrorMessage;

// Handle messages from the main thread
parentPort?.on('message', async (message: WorkerMessage) => {
  try {
    // Process the message based on its type
    switch (message.type) {
      case 'process':
        // Add your processing logic here
        const result = await processTask(message.data);
        parentPort?.postMessage({ type: 'result', data: result });
        break;
      
      default:
        parentPort?.postMessage({ 
          type: 'error', 
          error: `Unknown message type: ${message.type}` 
        });
    }
  } catch (error) {
    parentPort?.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

async function processTask(data: any): Promise<any> {
  // Add your task processing logic here
  return {
    status: 'success',
    result: `Processed: ${JSON.stringify(data)}`
  };
}

// Error handling for the worker
process.on('uncaughtException', (error: Error) => {
  parentPort?.postMessage({ 
    type: 'error', 
    error: `Uncaught Exception: ${error.message}` 
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  parentPort?.postMessage({ 
    type: 'error', 
    error: `Unhandled Rejection: ${reason}` 
  });
});