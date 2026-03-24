export const websocketClient = {
  connect: (
    onMessage: (event: { type: string; payload: unknown }) => void,
    onStatus?: (status: "connected" | "reconnecting" | "fallback_polling") => void
  ) => {
    let timer: ReturnType<typeof setInterval> | null = setInterval(() => {
      onMessage({ type: "heartbeat", payload: { at: Date.now() } });
    }, 5000);
    onStatus?.("connected");

    const reconnect = () => {
      onStatus?.("reconnecting");
      onStatus?.("fallback_polling");
    };

    return {
      close: () => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      },
      reconnect
    };
  }
};