import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTaskScope } from '../../src/core/task-scope';

afterEach(() => vi.useRealTimers());
describe('round task ownership', () => {
  it('cancels timers and animation frames together; a fresh round can schedule work', () => {
    vi.useFakeTimers();
    const scope = createTaskScope();
    const stale = vi.fn();
    scope.after(450, stale);
    scope.frame(stale);
    scope.cancel();
    vi.advanceTimersByTime(1000);
    expect(stale).not.toHaveBeenCalled();
    const fresh = vi.fn();
    scope.after(10, fresh);
    vi.advanceTimersByTime(10);
    expect(fresh).toHaveBeenCalledOnce();
    scope.dispose();
  });
  it('permanently stops disposed work, including attempts to schedule more callbacks', () => {
    vi.useFakeTimers();
    const scope = createTaskScope();
    const callback = vi.fn();
    scope.after(100, callback);
    scope.dispose();
    scope.after(100, callback);
    scope.frame(callback);
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
