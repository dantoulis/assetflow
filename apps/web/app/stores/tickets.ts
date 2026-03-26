import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { buildStatusDistribution } from '@/lib/app-analytics';
import type {
  AppTicket,
  AppTicketMessage,
  TicketCreatePayload,
  TicketMessageCreatePayload,
  TicketUpdatePayload,
} from '@/lib/app-types';
import { removeItemById } from './store-helpers';

export const useTicketsStore = defineStore('tickets', () => {
  const getApi = () => useAssetFlowApi();

  const tickets = ref<AppTicket[]>([]);
  const messagesByTicketId = ref<Record<number, AppTicketMessage[]>>({});
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const loadingMessages = ref<Record<number, boolean>>({});

  const count = computed(() => tickets.value.length);
  const openTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status !== 'RESOLVED'),
  );
  const pendingAdminTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'PENDING_ADMIN'),
  );
  const pendingUserTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'PENDING_USER'),
  );
  const resolvedTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.status === 'RESOLVED'),
  );
  const highPriorityTickets = computed(() =>
    tickets.value.filter((ticket) => ticket.priority === 'HIGH'),
  );
  const statusDistribution = computed(() => buildStatusDistribution(tickets.value));
  const countsByStatus = computed(() => ({
    OPEN: tickets.value.filter((ticket) => ticket.status === 'OPEN').length,
    PENDING_ADMIN: pendingAdminTickets.value.length,
    PENDING_USER: pendingUserTickets.value.length,
    RESOLVED: resolvedTickets.value.length,
  }));

  const resetStoreState = () => {
    tickets.value = [];
    messagesByTicketId.value = {};
    loadingMessages.value = {};
    isLoaded.value = false;
    isLoading.value = false;
  };

  const replaceAll = (nextTickets: AppTicket[]) => {
    tickets.value = nextTickets;
    isLoaded.value = true;
  };

  const upsert = (ticket: AppTicket) => {
    const index = tickets.value.findIndex((entry) => entry.id === ticket.id);

    if (index === -1) {
      tickets.value = [ticket, ...tickets.value];
      return ticket;
    }

    tickets.value[index] = ticket;
    tickets.value = [...tickets.value];
    return ticket;
  };

  const replaceMessages = (ticketId: number, messages: AppTicketMessage[]) => {
    messagesByTicketId.value = {
      ...messagesByTicketId.value,
      [ticketId]: messages,
    };
  };

  const removeMessageThread = (ticketId: number) => {
    const nextThreads: Record<number, AppTicketMessage[]> = {};

    for (const [currentTicketId, messages] of Object.entries(messagesByTicketId.value)) {
      const numericTicketId = Number(currentTicketId);

      if (numericTicketId !== ticketId) {
        nextThreads[numericTicketId] = messages;
      }
    }

    messagesByTicketId.value = nextThreads;
  };

  const removeLoadingState = (ticketId: number) => {
    const nextLoadingState: Record<number, boolean> = {};

    for (const [currentTicketId, isTicketLoading] of Object.entries(loadingMessages.value)) {
      const numericTicketId = Number(currentTicketId);

      if (numericTicketId !== ticketId) {
        nextLoadingState[numericTicketId] = isTicketLoading;
      }
    }

    loadingMessages.value = nextLoadingState;
  };

  const findTicketById = (id: number) => tickets.value.find((ticket) => ticket.id === id) ?? null;
  const messagesFor = (ticketId: number) => messagesByTicketId.value[ticketId] ?? [];

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return tickets.value;
    }

    const api = getApi();
    isLoading.value = true;

    try {
      const nextTickets = await api.fetchTickets();
      replaceAll(nextTickets);
      return tickets.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOne = async (id: number, force = false) => {
    const cachedTicket = findTicketById(id);

    if (cachedTicket && !force) {
      return cachedTicket;
    }

    const api = getApi();
    const ticket = await api.fetchTicket(id);
    return upsert(ticket);
  };

  const fetchMessages = async (ticketId: number, force = false) => {
    const cachedMessages = messagesFor(ticketId);

    if (cachedMessages.length && !force) {
      return cachedMessages;
    }

    const api = getApi();
    loadingMessages.value = {
      ...loadingMessages.value,
      [ticketId]: true,
    };

    try {
      const messages = await api.fetchTicketMessages(ticketId);
      replaceMessages(ticketId, messages);
      return messagesFor(ticketId);
    } finally {
      loadingMessages.value = {
        ...loadingMessages.value,
        [ticketId]: false,
      };
    }
  };

  const refreshThread = async (ticketId: number) => {
    const [ticket, messages] = await Promise.all([
      fetchOne(ticketId, true),
      fetchMessages(ticketId, true),
    ]);

    return { ticket, messages };
  };

  const createTicketWithMessage = async (payload: TicketCreatePayload, openingMessage: string) => {
    const api = getApi();
    const createdTicket = await api.createTicket(payload);

    await api.createTicketMessage(createdTicket.id, {
      body: openingMessage,
    });

    const hydratedTicket = await api.fetchTicket(createdTicket.id);
    upsert(hydratedTicket);
    return hydratedTicket;
  };

  const updateTicket = async (id: number, payload: TicketUpdatePayload) => {
    const api = getApi();
    const updatedTicket = await api.updateTicket(id, payload);
    return upsert(updatedTicket);
  };

  const sendMessage = async (ticketId: number, payload: TicketMessageCreatePayload) => {
    const api = getApi();
    const createdMessage = await api.createTicketMessage(ticketId, payload);

    replaceMessages(ticketId, [...messagesFor(ticketId), createdMessage]);
    await fetchOne(ticketId, true);

    return createdMessage;
  };

  const deleteTicket = async (id: number) => {
    const api = getApi();
    const deletedTicket = await api.deleteTicket(id);
    tickets.value = removeItemById(tickets.value, id);
    removeMessageThread(id);
    removeLoadingState(id);

    return deletedTicket;
  };

  const byRequesterId = (requesterId: number) =>
    tickets.value.filter((ticket) => ticket.requesterId === requesterId);
  const byAssetId = (assetId: number) =>
    tickets.value.filter((ticket) => ticket.assetId === assetId);
  const recent = (limit: number) =>
    [...tickets.value]
      .sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, limit);
  const attentionQueue = (limit: number) =>
    [...openTickets.value]
      .sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, limit);
  const recentByRequester = (requesterId: number, limit: number) =>
    [...byRequesterId(requesterId)]
      .sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
      .slice(0, limit);

  return {
    tickets,
    count,
    messagesByTicketId,
    openTickets,
    pendingAdminTickets,
    pendingUserTickets,
    resolvedTickets,
    highPriorityTickets,
    statusDistribution,
    countsByStatus,
    isLoaded,
    isLoading,
    loadingMessages,
    resetStoreState,
    fetchAll,
    fetchOne,
    fetchMessages,
    refreshThread,
    createTicketWithMessage,
    updateTicket,
    sendMessage,
    deleteTicket,
    replaceAll,
    replaceMessages,
    upsert,
    findTicketById,
    messagesFor,
    byRequesterId,
    byAssetId,
    recent,
    attentionQueue,
    recentByRequester,
  };
});
