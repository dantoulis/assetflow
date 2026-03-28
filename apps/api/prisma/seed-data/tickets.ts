import type { User } from '../../src/generated/prisma/client';
import {
  AssetType,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../../src/generated/prisma/enums';
import { addDays, addHours, daysAgo } from './helpers';
import type { SeededUser } from './users';

interface TicketMessageSeed {
  authorId: number;
  body: string;
  internal?: boolean;
  createdAt: Date;
}

export interface TicketSeedPlan {
  data: {
    subject: string;
    category: TicketCategory;
    status: TicketStatus;
    priority: TicketPriority;
    requesterId: number;
    assetId?: number;
    assignedAdminId: number;
    resolvedAt?: Date;
    createdAt: Date;
  };
  messages: TicketMessageSeed[];
}

interface TicketScenario {
  requesterIndex: number;
  assetType?: AssetType;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdDaysAgo: number;
  openingMessage: string;
  adminReply?: string;
  requesterFollowUp?: string;
  resolutionNote?: string;
  internalNote?: string;
}

const ticketScenarios: TicketScenario[] = [
  {
    requesterIndex: 0,
    assetType: AssetType.LICENSE,
    subject: 'GitHub Enterprise SSO access keeps dropping from mobile-ci',
    category: TicketCategory.ACCESS,
    status: TicketStatus.PENDING_USER,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 6,
    openingMessage:
      'I keep losing access to the mobile-ci repository after SSO refresh. The rest of GitHub works, but that repo disappears from the sidebar after re-login.',
    adminReply:
      'I re-applied your engineering repo group mapping and can see the entitlement on our side now. Please sign out of GitHub, sign back in, and confirm whether the repo stays visible.',
    internalNote:
      'SSO group sync failed during last identity provider sync. Reapplied engineering-contributors and reopened entitlement cache.',
  },
  {
    requesterIndex: 1,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Adobe Creative Cloud libraries are not syncing on the launch workspace',
    category: TicketCategory.SUBSCRIPTION,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 19,
    openingMessage:
      'Creative Cloud opens normally, but the shared launch libraries are stuck in a sync loop and nothing updates across Illustrator and Photoshop.',
    adminReply:
      'The issue was tied to an expired background service token. I refreshed the Adobe profile and forced a local sync on the device.',
    resolutionNote:
      'The libraries are now syncing again and the launch workspace is back to normal. Closing this ticket as resolved.',
    internalNote:
      'Adobe desktop services were signed in under an old profile token after the last password rotation.',
  },
  {
    requesterIndex: 2,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'HubSpot billing export is missing this month’s campaign invoices',
    category: TicketCategory.BILLING,
    status: TicketStatus.PENDING_ADMIN,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 9,
    openingMessage:
      'I pulled the HubSpot billing export for March and two campaign invoices are missing, which means finance cannot reconcile the spend line.',
    adminReply:
      'I checked the portal and the invoices are still marked as pending generation on HubSpot’s side. I opened a vendor case and asked for an ETA.',
    requesterFollowUp:
      'Thanks. Please keep this open until we have the final invoice PDF because finance needs it before month-end close.',
    internalNote:
      'Vendor case HS-44721 opened. Waiting on billing operations to reissue March invoice bundle.',
  },
  {
    requesterIndex: 3,
    assetType: AssetType.LICENSE,
    subject: 'Jira Service Management approval queue is routing to the wrong team',
    category: TicketCategory.OTHER,
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 4,
    openingMessage:
      'New procurement approvals are landing in the general IT queue instead of operations approvals, so requests are sitting untouched until someone manually reassigns them.',
  },
  {
    requesterIndex: 4,
    assetType: AssetType.PERIPHERAL,
    subject: 'Headset microphone cuts out during customer onboarding calls',
    category: TicketCategory.HARDWARE,
    status: TicketStatus.PENDING_USER,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 7,
    openingMessage:
      'The headset mic drops out after about ten minutes on calls. The speakers still work, but customers cannot hear me until I reconnect the device.',
    adminReply:
      'I pushed a firmware update and switched the headset to the latest Bluetooth profile. Please test it on your next onboarding session and tell me if the dropouts continue.',
    internalNote:
      'Jabra firmware lagging by two versions. Updated through vendor desktop app and reset Bluetooth pairing.',
  },
  {
    requesterIndex: 5,
    assetType: AssetType.LAPTOP,
    subject: 'MacBook battery health is dropping too fast during incident shifts',
    category: TicketCategory.HARDWARE,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 28,
    openingMessage:
      'The laptop battery drops below 40 percent within an hour when I am on incident duty and running local containers. It did not behave like this last month.',
    adminReply:
      'Battery diagnostics showed abnormal wear for the current cycle count. We ran the warranty service check and recalibrated power settings after the battery swap.',
    resolutionNote:
      'The replacement battery is holding expected charge again, so I am resolving the ticket.',
    internalNote:
      'Apple battery service completed under warranty. Device re-enrolled and charge profile recalibrated.',
  },
  {
    requesterIndex: 6,
    assetType: AssetType.LICENSE,
    subject: 'Figma comments are not syncing between design review sessions',
    category: TicketCategory.ACCESS,
    status: TicketStatus.PENDING_ADMIN,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 12,
    openingMessage:
      'Comments from the roadmap review are visible in the browser but do not appear in the desktop app, which is blocking handoff notes.',
    adminReply:
      'I confirmed the account is stuck on an old workspace cache. I asked Figma support for the workspace-side cache reset and am waiting on their confirmation.',
    requesterFollowUp:
      'Understood. We have another review tomorrow morning, so I would appreciate an update before then if support answers.',
  },
  {
    requesterIndex: 7,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Xero reporting view is missing the regional ledger export',
    category: TicketCategory.ACCESS,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 23,
    openingMessage:
      'The regional ledger export disappeared from my Xero reporting menu after the plan migration. I can still open the standard dashboard, just not the export view finance needs.',
    adminReply:
      'Your role lost the reporting add-on permission during the migration. I restored the finance-controllers permission set and re-ran the entitlement sync.',
    resolutionNote:
      'The export is visible again and the month-end close packet is complete, so this can be closed.',
  },
  {
    requesterIndex: 8,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Salesforce sequences stopped enrolling new inbound leads',
    category: TicketCategory.ACCESS,
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 2,
    openingMessage:
      'Inbound leads are hitting Salesforce, but none of them are moving into the sequence enrollment step. This started right after yesterday’s workflow update.',
  },
  {
    requesterIndex: 9,
    assetType: AssetType.LAPTOP,
    subject: 'ThinkPad replacement unit still shows old asset tag in MDM',
    category: TicketCategory.HARDWARE,
    status: TicketStatus.PENDING_ADMIN,
    priority: TicketPriority.LOW,
    createdDaysAgo: 16,
    openingMessage:
      'The replacement ThinkPad works, but the MDM still shows the previous asset tag and user record, so our inventory reports look wrong.',
    adminReply:
      'The device was swapped in the hardware inventory but the MDM sync job did not finish. I kicked a manual inventory refresh and am waiting for the record to update.',
    requesterFollowUp:
      'Please keep me posted once the correct tag is visible because I need to reference it in the next stock count.',
  },
  {
    requesterIndex: 10,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'dbt Cloud job runner cannot access the scheduled production target',
    category: TicketCategory.ACCESS,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 21,
    openingMessage:
      'Scheduled jobs are failing in dbt Cloud because the production target no longer appears in the deployment environment. Manual runs against development still work.',
    adminReply:
      'The deployment credential rotated, but the environment service account did not receive the new target binding. I reissued the credential and refreshed the job connection.',
    resolutionNote:
      'Scheduled production runs are back and the next hourly model run completed successfully. Resolving the ticket.',
    internalNote:
      'Credential rotation completed without updating environment binding. Added checklist item for future rotations.',
  },
  {
    requesterIndex: 11,
    assetType: AssetType.LICENSE,
    subject: 'Gong call recordings are not attaching to the correct opportunity',
    category: TicketCategory.OTHER,
    status: TicketStatus.PENDING_USER,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 11,
    openingMessage:
      'Recent Gong recordings are landing in the wrong opportunity thread, which makes the deal review notes hard to trust.',
    adminReply:
      'I fixed the Salesforce matching rule on our side and forced a resync for yesterday’s calls. Please review the last two opportunities and confirm whether new recordings attach correctly.',
  },
  {
    requesterIndex: 0,
    assetType: AssetType.PERIPHERAL,
    subject: 'Monitor flickers after waking from sleep',
    category: TicketCategory.HARDWARE,
    status: TicketStatus.PENDING_ADMIN,
    priority: TicketPriority.LOW,
    createdDaysAgo: 18,
    openingMessage:
      'The external monitor comes back with a heavy flicker after the laptop wakes from sleep. Reconnecting the cable fixes it, but only until the next sleep cycle.',
    adminReply:
      'I updated the dock firmware and monitor driver profile. If the flicker comes back tomorrow, I will swap the cable and docking station.',
    requesterFollowUp:
      'It is still happening after the firmware update, especially when I reconnect to the desk after meetings.',
  },
  {
    requesterIndex: 3,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Notion procurement dashboard shows stale vendor status',
    category: TicketCategory.OTHER,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.LOW,
    createdDaysAgo: 33,
    openingMessage:
      'The procurement dashboard in Notion still shows the February vendor states, even though the underlying database has the March updates.',
    adminReply:
      'The linked view had a stale filter token after the database duplicate. I rebuilt the view and restored the live relation filter.',
    resolutionNote:
      'The dashboard is reflecting the current vendor states again. Closing this one out.',
  },
  {
    requesterIndex: 4,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Intercom inbox rule is skipping onboarding conversations',
    category: TicketCategory.ACCESS,
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    createdDaysAgo: 1,
    openingMessage:
      'New onboarding conversations are landing in the shared inbox instead of my queue, so handoffs are getting delayed until someone notices them manually.',
  },
  {
    requesterIndex: 6,
    assetType: AssetType.SUBSCRIPTION,
    subject: 'Notion launch checklist loads without the latest template sections',
    category: TicketCategory.SUBSCRIPTION,
    status: TicketStatus.PENDING_USER,
    priority: TicketPriority.LOW,
    createdDaysAgo: 14,
    openingMessage:
      'The launch checklist page is missing the QA and rollout sections when I create a new page from the template.',
    adminReply:
      'I restored the default template block set and republished the workspace template. Please create a fresh checklist page and confirm that the sections are back.',
  },
  {
    requesterIndex: 8,
    assetType: AssetType.PERIPHERAL,
    subject: 'Webcam exposure keeps pulsing during webinar recordings',
    category: TicketCategory.HARDWARE,
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.MEDIUM,
    createdDaysAgo: 24,
    openingMessage:
      'The webcam exposure keeps pulsing during webinar recordings, which looks distracting in every clip we reviewed from the last launch.',
    adminReply:
      'The webcam utility had auto-exposure locked to a vendor preset. I reset it to manual exposure and updated the capture profile.',
    resolutionNote:
      'We recorded a test webinar and the exposure is stable now, so this can be closed.',
  },
];

const getAssetIdForScenario = (user: SeededUser, scenario: TicketScenario) => {
  if (!scenario.assetType) {
    return undefined;
  }

  return user.assets.find((asset) => asset.type === scenario.assetType)?.id;
};

const buildMessages = (scenario: TicketScenario, user: SeededUser, admin: User, openedAt: Date) => {
  const messages: TicketMessageSeed[] = [
    {
      authorId: user.id,
      body: scenario.openingMessage,
      createdAt: openedAt,
    },
  ];

  if (scenario.adminReply) {
    messages.push({
      authorId: admin.id,
      body: scenario.adminReply,
      createdAt: addHours(openedAt, 4),
    });
  }

  if (scenario.internalNote) {
    messages.push({
      authorId: admin.id,
      body: `Internal note: ${scenario.internalNote}`,
      internal: true,
      createdAt: addHours(openedAt, 5),
    });
  }

  if (scenario.requesterFollowUp) {
    messages.push({
      authorId: user.id,
      body: scenario.requesterFollowUp,
      createdAt: addDays(openedAt, 1, 10, 15),
    });
  }

  if (scenario.resolutionNote) {
    messages.push({
      authorId: admin.id,
      body: scenario.resolutionNote,
      createdAt: addDays(openedAt, 1, 14, 0),
    });
  }

  return messages;
};

export const buildTicketSeedPlans = (admin: User, users: SeededUser[]): TicketSeedPlan[] => {
  return ticketScenarios.map((scenario) => {
    const requester = users[scenario.requesterIndex]!;
    const openedAt = daysAgo(scenario.createdDaysAgo, 9 + (scenario.requesterIndex % 4), 20);
    const messages = buildMessages(scenario, requester, admin, openedAt);
    const resolutionMessage = messages.findLast(
      (message) => message.authorId === admin.id && !message.internal,
    );

    return {
      data: {
        subject: scenario.subject,
        category: scenario.category,
        status: scenario.status,
        priority: scenario.priority,
        requesterId: requester.id,
        assetId: getAssetIdForScenario(requester, scenario),
        assignedAdminId: admin.id,
        resolvedAt:
          scenario.status === TicketStatus.RESOLVED ? resolutionMessage?.createdAt : undefined,
        createdAt: openedAt,
      },
      messages,
    };
  });
};
