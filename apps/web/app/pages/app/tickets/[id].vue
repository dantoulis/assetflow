<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Ticket detail"
      :title="activeTicket.subject"
      description="This is the user-side thread view. It intentionally hides every other conversation in the system and only shows what belongs to your account."
    />

    <section class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Thread status</CardTitle>
          <CardDescription>What the ticket is waiting on right now.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="activeTicket.status" />
            <StatusBadge :status="activeTicket.priority" />
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Last updated</p>
            <p class="mt-1 font-semibold">{{ formatRelativeDate(activeTicket.updatedAt) }}</p>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Category</p>
            <p class="mt-1 font-semibold">{{ activeTicket.category }}</p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Only the user-visible thread is rendered here.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationThread :messages="localMessages" :current-user-id="viewer.id" />
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription
              >The composer is real, but the reply stays in mock state until the API
              phase.</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <Textarea
              v-model="draft"
              class="min-h-36 rounded-3xl"
              placeholder="Write your reply..."
            />
            <div class="flex flex-wrap gap-3">
              <Button class="rounded-2xl" @click="sendReply">
                <MessageSquareReply class="size-4" />
                Send reply
              </Button>
              <Button
                variant="outline"
                class="rounded-2xl"
                @click="toast.message('Attachments will be added in a later pass.')"
              >
                <Sparkles class="size-4" />
                Attach file
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { MessageSquareReply, Sparkles } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { formatRelativeDate, getMessagesForTicket, getTicketById } from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
  middleware: 'auth',
});

const { currentUser } = useMockAuth();

if (!currentUser.value) throw createError({ statusCode: 401, statusMessage: 'Missing session' });

const route = useRoute();
const ticket = getTicketById(route.params.id as string);

if (!ticket || ticket.userId !== currentUser.value.id)
  throw createError({ statusCode: 404, statusMessage: 'Ticket not found' });

const activeTicket = ticket;
const viewer = currentUser.value;

useHead({
  title: activeTicket.subject,
});

const draft = ref('');
const localMessages = ref([...getMessagesForTicket(activeTicket.id)]);

const sendReply = () => {
  if (!draft.value.trim()) return;

  localMessages.value.push({
    id: `local-${Date.now()}`,
    ticketId: activeTicket.id,
    authorId: viewer.id,
    body: draft.value.trim(),
    createdAt: new Date().toISOString(),
  });

  toast.success('Reply added in preview mode');
  draft.value = '';
};
</script>
