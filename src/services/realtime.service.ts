type RealtimePublisher = (channel: string, payload: unknown) => void;

let publisher: RealtimePublisher | undefined;

/**
 * Connect the domain layer to the active WebSocket server without importing
 * the server entry point into controllers.
 */
export function configureRealtimePublisher(nextPublisher: RealtimePublisher) {
  publisher = nextPublisher;
}

export function broadcastUpdate(channel: string, payload: unknown) {
  publisher?.(channel, payload);
}
