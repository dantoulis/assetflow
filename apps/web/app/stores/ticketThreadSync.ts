import { defineStore } from 'pinia';

export const useTicketThreadSyncStore = defineStore('ticketThreadSync', () => {
  const ticketsStore = useTicketsStore();
  const activeTimers = new Map<number, number>();

  const startTicketThreadSync = (ticketId: number, intervalMs = 2500) => {
    if (!import.meta.client || activeTimers.has(ticketId)) {
      return;
    }

    // Keep one refresh loop per open thread and refresh immediately on entry.
    void ticketsStore.refreshThread(ticketId);

    const timerId = window.setInterval(() => {
      void ticketsStore.refreshThread(ticketId);
    }, intervalMs);

    activeTimers.set(ticketId, timerId);
  };

  const stopTicketThreadSync = (ticketId: number) => {
    const timerId = activeTimers.get(ticketId);

    if (!timerId) {
      return;
    }

    clearInterval(timerId);
    activeTimers.delete(ticketId);
  };

  const stopAllTicketThreadSync = () => {
    for (const timerId of activeTimers.values()) {
      clearInterval(timerId);
    }

    activeTimers.clear();
  };

  const isTicketThreadSyncActive = (ticketId: number) => activeTimers.has(ticketId);

  return {
    startTicketThreadSync,
    stopTicketThreadSync,
    stopAllTicketThreadSync,
    isTicketThreadSyncActive,
  };
});
