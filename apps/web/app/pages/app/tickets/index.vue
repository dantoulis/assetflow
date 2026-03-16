<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Support"
      title="Your ticket threads in one place."
      description="Users only see their own support conversations. This page is intentionally scoped to your account and the assets assigned to you."
    >
      <template #actions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button class="rounded-2xl">
              <MessageCirclePlus class="size-4" />
              New ticket
            </Button>
          </DialogTrigger>
          <DialogContent class="rounded-3xl sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Open a new support ticket</DialogTitle>
              <DialogDescription
                >This is wired as a frontend-only preview for now.</DialogDescription
              >
            </DialogHeader>
            <div class="grid gap-4 py-2">
              <div class="space-y-2">
                <Label for="ticket-asset">Related asset</Label>
                <select
                  id="ticket-asset"
                  v-model="draftTicket.assetId"
                  class="flex h-12 w-full rounded-2xl border border-input bg-transparent px-4 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option v-for="asset in assets" :key="asset.id" :value="asset.id">
                    {{ asset.title }}
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="ticket-subject">Subject</Label>
                <Input
                  id="ticket-subject"
                  v-model="draftTicket.subject"
                  class="h-12 rounded-2xl"
                  placeholder="What needs attention?"
                />
              </div>
              <div class="space-y-2">
                <Label for="ticket-message">Message</Label>
                <Textarea
                  id="ticket-message"
                  v-model="draftTicket.message"
                  class="min-h-32 rounded-3xl"
                  placeholder="Describe the issue in detail..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" class="rounded-2xl" @click="dialogOpen = false"
                >Cancel</Button
              >
              <Button class="rounded-2xl" @click="submitTicket">Create ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-3">
      <MetricCard
        title="All conversations"
        :value="`${tickets.length}`"
        delta="Visible to you"
        hint="Only ticket threads tied to your account are shown here."
      >
        <template #icon><MessagesSquare class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Waiting on admin"
        :value="`${tickets.filter((ticket) => ticket.status === 'PENDING_ADMIN').length}`"
        delta="Queue"
        hint="Tickets where the next action belongs to the admin team."
        tone="warning"
      >
        <template #icon><ShieldCheck class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Resolved"
        :value="`${tickets.filter((ticket) => ticket.status === 'RESOLVED').length}`"
        delta="Closed loop"
        hint="Finished conversations you can still revisit later."
        tone="success"
      >
        <template #icon><Sparkles class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Ticket list</CardTitle>
        <CardDescription
          >A straightforward view of thread state, urgency, and recency.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="ticket in tickets"
          :key="ticket.id"
          :to="`/app/tickets/${ticket.id}`"
          class="block rounded-3xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:bg-primary/5"
        >
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="ticket.status" />
            <StatusBadge :status="ticket.priority" />
          </div>
          <p class="mt-3 font-semibold">{{ ticket.subject }}</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ ticket.preview }}</p>
          <p class="mt-3 text-xs text-muted-foreground">
            Updated {{ formatRelativeDate(ticket.updatedAt) }}
          </p>
        </NuxtLink>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { MessageCirclePlus, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { formatRelativeDate, getAssetsForUser, getTicketsForUser } from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
  middleware: 'auth',
});

const { currentUser } = useMockAuth();

if (!currentUser.value) throw createError({ statusCode: 401, statusMessage: 'Missing session' });

useHead({
  title: 'My Tickets',
});

const assets = getAssetsForUser(currentUser.value.id);
const tickets = ref(getTicketsForUser(currentUser.value.id));
const dialogOpen = ref(false);
const draftTicket = reactive({
  assetId: assets[0]?.id ?? '',
  subject: '',
  message: '',
});

const submitTicket = () => {
  if (!draftTicket.subject.trim() || !draftTicket.message.trim()) {
    toast.error('Add a subject and a message first.');
    return;
  }

  toast.success('Ticket created in preview mode', {
    description: 'The composer is real, but the message only exists in the frontend for now.',
  });
  dialogOpen.value = false;
  draftTicket.subject = '';
  draftTicket.message = '';
};
</script>
