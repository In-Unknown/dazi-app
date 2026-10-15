/** Work belongs to a round. Navigation cancels it; disposal also prevents new work. */
export function createTaskScope() {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const frames = new Set<number>();
  let disposed = false;
  function cancel() {
    timers.forEach(clearTimeout);
    frames.forEach(cancelAnimationFrame);
    timers.clear();
    frames.clear();
  }
  return {
    after(delayMs: number, callback: () => void) {
      if (disposed) return;
      const id = setTimeout(() => {
        timers.delete(id);
        if (!disposed) callback();
      }, delayMs);
      timers.add(id);
    },
    frame(callback: FrameRequestCallback) {
      if (disposed) return 0;
      const id = requestAnimationFrame((time) => {
        frames.delete(id);
        if (!disposed) callback(time);
      });
      frames.add(id);
      return id;
    },
    cancelFrame(id: number) {
      cancelAnimationFrame(id);
      frames.delete(id);
    },
    cancel,
    dispose() {
      cancel();
      disposed = true;
    },
  };
}
export type TaskScope = ReturnType<typeof createTaskScope>;
