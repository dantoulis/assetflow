<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Ticket detail"
      :title="activeTicket.subject"
      description="This thread view is intentionally full-context: status, priority, linked asset, current owner, and the conversation itself in one surface."
    />

    <section class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Metadata the admin typically needs before replying.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="currentStatus" />
            <StatusBadge :status="activeTicket.priority" />
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">User</p>
            <p class="mt-1 font-semibold">{{ getUserById(activeTicket.userId)?.name }}</p>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Linked asset</p>
            <p class="mt-1 font-semibold">
              {{ getAssetById(activeTicket.assetId ?? '')?.title ?? 'General request' }}
            </p>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Last updated</p>
            <p class="mt-1 font-semibold">{{ formatRelativeDate(activeTicket.updatedAt) }}</p>
          </div>
          <div class="grid gap-2">
            <p class="text-sm font-semibold">Status controls</p>
            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                class="rounded-2xl"
                @click="currentStatus = 'OPEN'"
                >Open</Button
              >
              <Button
                size="sm"
                variant="outline"
                class="rounded-2xl"
                @click="currentStatus = 'PENDING_ADMIN'"
                >Pending admin</Button
              >
              <Button
                size="sm"
                variant="outline"
                class="rounded-2xl"
                @click="currentStatus = 'PENDING_USER'"
                >Pending user</Button
              >
              <Button size="sm" class="rounded-2xl" @click="currentStatus = 'RESOLVED'"
                >Resolve</Button
              >
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription
              >Internal notes can stay visible in the admin surface while remaining hidden from the
              user surface.</CardDescription
            >
          </CardHeader>
          <CardContent>
            <ConversationThread
              :messages="localMessages"
              :current-user-id="adminViewer.id"
              include-internal
            />
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Reply composer</CardTitle>
            <CardDescription
              >Mocked interaction only, but structured the way the backend endpoint will later
              expect it.</CardDescription
            >
          </CardHeader>
          <CardContent class="space-y-4">
            <Textarea
              v-model="draft"
              class="min-h-36 rounded-3xl"
              placeholder="Write a reply or internal note..."
            />
            <label
              class="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/55 px-4 py-3 text-sm"
            >
              <input
                v-model="internalNote"
                type="checkbox"
                class="size-4 rounded border-border bg-background"
              />
              Save as internal admin note
            </label>
            <div class="flex flex-wrap gap-3">
              <Button class="rounded-2xl" @click="sendReply">
                <MessageSquareReply class="size-4" />
                Send reply
              </Button>
              <Button
                variant="outline"
                class="rounded-2xl"
                @click="toast.message('Template responses will be added later.')"
              >
                <Sparkles class="size-4" />
                Use template
              </Button>
              <Button
                variant="ghost"
                class="rounded-2xl"
                @click="toast.message('Assignee controls belong to the future backend phase.')"
              >
                <ShieldCheck class="size-4" />
                Reassign ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { MessageSquareReply, ShieldCheck, Sparkles } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatRelativeDate,
  getAssetById,
  getMessagesForTicket,
  getTicketById,
  getUserById,
  previewAdminUser,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const ticket = getTicketById(route.params.id as string);

if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Ticket not found' });

const activeTicket = ticket;

useHead({
  title: activeTicket.subject,
});

const adminViewer = previewAdminUser;
const currentStatus = ref(activeTicket.status);
const internalNote = ref(false);
const draft = ref('');
const localMessages = ref([...getMessagesForTicket(activeTicket.id)]);

const sendReply = () => {
  if (!draft.value.trim()) return;

  localMessages.value.push({
    id: `local-${Date.now()}`,
    ticketId: activeTicket.id,
    authorId: adminViewer.id,
    body: draft.value.trim(),
    createdAt: new Date().toISOString(),
    internal: internalNote.value,
  });

  toast.success(internalNote.value ? 'Internal note added' : 'Reply staged in mock thread');
  draft.value = '';
  internalNote.value = false;
};
</script>
