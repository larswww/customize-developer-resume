import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Export a function to initialize the worker
export async function startWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Start the worker with default options - MSW will find the service worker
    // at the root (/mockServiceWorker.js) by default
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
    console.log('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    console.error('[MSW] Failed to start Mock Service Worker:', error);
  }
} 