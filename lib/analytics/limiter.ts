/**
 * At most `size` tasks in flight, the rest queued first-in first-out. PostHog
 * runs only a few queries per project at once and the Search Console URL
 * Inspection API caps requests per minute, so a dashboard that asks for a
 * dozen things in one render queues them instead of tripping the limit.
 *
 * A task that throws (synchronously or not) rejects only its own caller and
 * frees its slot.
 */
export const createLimiter = (size: number) => {
  let active = 0;
  const queue: (() => void)[] = [];

  const next = () => {
    if (active >= size) return;
    const start = queue.shift();
    if (start) start();
  };

  return <T>(task: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      queue.push(() => {
        active++;
        Promise.resolve()
          .then(task)
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
};
