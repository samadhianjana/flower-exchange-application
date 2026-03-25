import { apiClient } from "./apiClient";

export type LiveStatus = "connected" | "reconnecting" | "fallback_polling";

export const websocketClient = {
  connect: (
    onMessage: (event: { type: string; payload: unknown }) => void,
    onStatus?: (status: LiveStatus) => void
  ) => {
    let status: LiveStatus = "connected";
    onStatus?.(status);

    const unsubscribe = apiClient.subscribeLiveEvents((event) => onMessage(event));
    let timer: ReturnType<typeof setInterval> | null = setInterval(() => {
      onMessage({ type: "heartbeat", payload: { at: Date.now() } });
    }, 5000);

    const reconnect = () => {
      status = "reconnecting";
      onStatus?.(status);
      setTimeout(() => {
        status = "connected";
        onStatus?.(status);
      }, 600);
    };

    const close = () => {
      unsubscribe();
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      status = "fallback_polling";
      onStatus?.(status);
    };

    return {
      close,
      reconnect
    };
  }
};