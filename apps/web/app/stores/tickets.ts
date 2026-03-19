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

export const useTicketsStore = defineStore('tickets', () => {
  const api = useAssetFlowApi();

  const tickets = ref<AppTicket[]>([]);
  const messagesByTicketId = ref<Record<number, AppTicketMessage[]>>({});
  const isLoaded = ref(false);
  const isLoading = ref(false);
  const loadingMessages = ref<Record<number, boolean>>({});

  const byId = computed(
    () =>
      Object.fromEntries(tickets.value.map((ticket) => [ticket.id, ticket])) as Record<
        number,
        AppTicket
      >,
  );
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

  const messagesFor = (ticketId: number) => messagesByTicketId.value[ticketId] ?? [];

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return tickets.value;
    }

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
    const cachedTicket = byId.value[id];

    if (cachedTicket && !force) {
      return cachedTicket;
    }

    const ticket = await api.fetchTicket(id);
    return upsert(ticket);
  };

  const fetchMessages = async (ticketId: number, force = false) => {
    const cachedMessages = messagesFor(ticketId);

    if (cachedMessages.length && !force) {
      return cachedMessages;
    }

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
    const createdTicket = await api.createTicket(payload);

    await api.createTicketMessage(createdTicket.id, {
      body: openingMessage,
    });

    const hydratedTicket = await api.fetchTicket(createdTicket.id);
    upsert(hydratedTicket);
    return hydratedTicket;
  };

  const updateTicket = async (id: number, payload: TicketUpdatePayload) => {
    const updatedTicket = await api.updateTicket(id, payload);
    return upsert(updatedTicket);
  };

  const sendMessage = async (ticketId: number, payload: TicketMessageCreatePayload) => {
    const createdMessage = await api.createTicketMessage(ticketId, payload);

    replaceMessages(ticketId, [...messagesFor(ticketId), createdMessage]);
    await fetchOne(ticketId, true);

    return createdMessage;
  };

  const deleteTicket = async (id: number) => {
    const deletedTicket = await api.deleteTicket(id);
    tickets.value = tickets.value.filter((ticket) => ticket.id !== id);

    const nextMessages = { ...messagesByTicketId.value };
    delete nextMessages[id];
    messagesByTicketId.value = nextMessages;

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
    byId,
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
    messagesFor,
    byRequesterId,
    byAssetId,
    recent,
    attentionQueue,
    recentByRequester,
  };
});
