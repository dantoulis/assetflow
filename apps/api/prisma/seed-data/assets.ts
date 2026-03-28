import { AssetStatus, AssetType, BillingCycle } from '../../src/generated/prisma/enums';
import { daysAgo, daysFromNow } from './helpers';
import type { SeedPersona, SeedUserProfile } from './profiles';

interface AssetTemplate {
  title: string;
  vendor: string;
  type: AssetType;
  billingCycle: BillingCycle;
  notes: string;
  tags: string[];
  seatCount?: number | null;
}

const personaTeamCodes: Record<SeedPersona, string> = {
  ENGINEERING: 'ENG',
  PRODUCT: 'PRD',
  GROWTH: 'GRW',
  OPERATIONS: 'OPS',
  SUCCESS: 'CS',
  DATA: 'DATA',
  FINANCE: 'FIN',
  SALES: 'SAL',
};

const personaAssetBundles: Record<SeedPersona, AssetTemplate[]> = {
  ENGINEERING: [
    {
      title: 'MacBook Pro 14" (M3)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes:
        'Primary development laptop enrolled in device management and assigned as the daily driver.',
      tags: ['hardware', 'engineering', 'core-device'],
    },
    {
      title: 'GitHub Enterprise seat',
      vendor: 'GitHub',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Private repository access, pull request reviews, and protected branch workflows.',
      tags: ['software', 'engineering', 'source-control'],
    },
    {
      title: 'Linear workspace seat',
      vendor: 'Linear',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Planning and issue tracking seat for sprint execution and release coordination.',
      tags: ['software', 'planning', 'engineering'],
    },
    {
      title: 'Dell UltraSharp 27" monitor',
      vendor: 'Dell',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Standard external display for the home and office workspace setup.',
      tags: ['hardware', 'workspace', 'display'],
    },
    {
      title: '1Password Business seat',
      vendor: '1Password',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Shared vault access for secrets, credentials, and secure document storage.',
      tags: ['security', 'software', 'engineering'],
    },
  ],
  PRODUCT: [
    {
      title: 'MacBook Pro 14" (M3)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes:
        'Primary design and product laptop configured for prototyping, workshops, and review sessions.',
      tags: ['hardware', 'product', 'core-device'],
    },
    {
      title: 'Figma Organization seat',
      vendor: 'Figma',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Design system, prototype, and design review access for product squads.',
      tags: ['design', 'software', 'product'],
    },
    {
      title: 'Adobe Creative Cloud license',
      vendor: 'Adobe',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Used for image editing, export work, and presentation polish on launches.',
      tags: ['design', 'creative', 'software'],
    },
    {
      title: 'Wacom Intuos tablet',
      vendor: 'Wacom',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Peripheral for design sketching, quick annotations, and whiteboarding workflows.',
      tags: ['hardware', 'design', 'peripheral'],
    },
    {
      title: 'Notion Plus seat',
      vendor: 'Notion',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Product documentation, launch checklists, and knowledge base collaboration seat.',
      tags: ['documentation', 'software', 'product'],
    },
  ],
  GROWTH: [
    {
      title: 'MacBook Air 13" (M2)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Lightweight machine used for campaign work, reporting, and travel days.',
      tags: ['hardware', 'growth', 'core-device'],
    },
    {
      title: 'HubSpot Marketing Pro seat',
      vendor: 'HubSpot',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Campaign automation, form routing, and attribution reporting seat.',
      tags: ['growth', 'software', 'campaigns'],
    },
    {
      title: 'Notion Plus seat',
      vendor: 'Notion',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Used for campaign calendars, experiment briefs, and content operations.',
      tags: ['growth', 'documentation', 'software'],
    },
    {
      title: 'Logitech Brio webcam',
      vendor: 'Logitech',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'High-definition webcam used for webinars, interviews, and partnership calls.',
      tags: ['hardware', 'video', 'peripheral'],
    },
  ],
  OPERATIONS: [
    {
      title: 'ThinkPad X1 Carbon',
      vendor: 'Lenovo',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Core operations laptop used across vendor management, procurement, and approvals.',
      tags: ['hardware', 'operations', 'core-device'],
    },
    {
      title: 'Jira Service Management agent seat',
      vendor: 'Atlassian',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Agent access for intake queues, approvals, and service desk workflows.',
      tags: ['operations', 'service-desk', 'software'],
    },
    {
      title: 'Notion Plus seat',
      vendor: 'Notion',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Runbooks, onboarding notes, and vendor documentation live in this workspace seat.',
      tags: ['operations', 'documentation', 'software'],
    },
    {
      title: 'Plantronics Voyager headset',
      vendor: 'Poly',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Noise-cancelling headset for service desk calls and internal coordination.',
      tags: ['hardware', 'audio', 'peripheral'],
    },
  ],
  SUCCESS: [
    {
      title: 'MacBook Air 13" (M2)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Daily laptop used for customer handoffs, call prep, and account planning.',
      tags: ['hardware', 'success', 'core-device'],
    },
    {
      title: 'Intercom support seat',
      vendor: 'Intercom',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Customer conversations, routing rules, and inbox ownership seat.',
      tags: ['success', 'software', 'support'],
    },
    {
      title: 'Loom Business seat',
      vendor: 'Loom',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Async walkthrough videos used for onboarding and issue reproduction.',
      tags: ['success', 'video', 'software'],
    },
    {
      title: 'Jabra Evolve2 65 headset',
      vendor: 'Jabra',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Primary call headset for onboarding sessions and escalation calls.',
      tags: ['hardware', 'audio', 'customer-facing'],
    },
  ],
  DATA: [
    {
      title: 'MacBook Pro 16" (M3 Pro)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Analyst workstation for modeling, dashboards, and notebook-heavy workflows.',
      tags: ['hardware', 'data', 'core-device'],
    },
    {
      title: 'dbt Cloud Team seat',
      vendor: 'dbt',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Transformation job access and orchestration seat for analytics engineering.',
      tags: ['data', 'software', 'transformation'],
    },
    {
      title: 'Looker Studio Pro license',
      vendor: 'Google',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Dashboard publishing and stakeholder sharing license for business reporting.',
      tags: ['data', 'reporting', 'software'],
    },
    {
      title: 'Dell UltraSharp 27" monitor',
      vendor: 'Dell',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Used for side-by-side dashboard reviews and spreadsheet work.',
      tags: ['hardware', 'display', 'data'],
    },
  ],
  FINANCE: [
    {
      title: 'ThinkPad X1 Carbon',
      vendor: 'Lenovo',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Primary finance workstation used for month-end close and procurement approvals.',
      tags: ['hardware', 'finance', 'core-device'],
    },
    {
      title: 'Xero Analytics Plus seat',
      vendor: 'Xero',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Reporting access for reconciliations, budget tracking, and forecast snapshots.',
      tags: ['finance', 'software', 'reporting'],
    },
    {
      title: 'Ramp admin seat',
      vendor: 'Ramp',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Used for expense reviews, card controls, and month-end finance workflows.',
      tags: ['finance', 'operations', 'software'],
    },
    {
      title: 'Dell USB-C dock',
      vendor: 'Dell',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Desk docking station for dual displays and finance peripherals.',
      tags: ['hardware', 'workspace', 'finance'],
    },
  ],
  SALES: [
    {
      title: 'MacBook Air 13" (M2)',
      vendor: 'Apple',
      type: AssetType.LAPTOP,
      billingCycle: BillingCycle.ONCE,
      notes: 'Portable laptop used for demos, pipeline reviews, and travel-heavy account work.',
      tags: ['hardware', 'sales', 'core-device'],
    },
    {
      title: 'Salesforce Sales Cloud seat',
      vendor: 'Salesforce',
      type: AssetType.SUBSCRIPTION,
      billingCycle: BillingCycle.MONTHLY,
      seatCount: 1,
      notes: 'Pipeline management, opportunity updates, and account handoff seat.',
      tags: ['sales', 'software', 'crm'],
    },
    {
      title: 'Gong seat',
      vendor: 'Gong',
      type: AssetType.LICENSE,
      billingCycle: BillingCycle.YEARLY,
      seatCount: 1,
      notes: 'Conversation intelligence seat for deal reviews and coaching sessions.',
      tags: ['sales', 'software', 'enablement'],
    },
    {
      title: 'AirPods Pro',
      vendor: 'Apple',
      type: AssetType.PERIPHERAL,
      billingCycle: BillingCycle.ONCE,
      notes: 'Mobile audio device for calls while travelling between client meetings.',
      tags: ['hardware', 'audio', 'sales'],
    },
  ],
};

const resolveAssetStatus = (
  template: AssetTemplate,
  userIndex: number,
  assetIndex: number,
): AssetStatus => {
  const sequence = userIndex + assetIndex + 1;

  if (template.billingCycle !== BillingCycle.ONCE && sequence % 11 === 0) {
    return AssetStatus.EXPIRED;
  }

  if (template.type === AssetType.PERIPHERAL && sequence % 9 === 0) {
    return AssetStatus.IN_REPAIR;
  }

  if (template.billingCycle !== BillingCycle.ONCE && sequence % 4 === 0) {
    return AssetStatus.EXPIRING_SOON;
  }

  return AssetStatus.ACTIVE;
};

const buildAssetReference = (persona: SeedPersona, userIndex: number, assetIndex: number) =>
  `AST-${personaTeamCodes[persona]}-${String(userIndex + 1).padStart(2, '0')}-${String(assetIndex + 1).padStart(2, '0')}`;

export const buildAssetsForUser = (profile: SeedUserProfile, userIndex: number) => {
  return personaAssetBundles[profile.persona].map((template, assetIndex) => {
    const createdDaysAgo = Math.max(18, 220 - userIndex * 11 - assetIndex * 7);
    const assignedDaysAgo = Math.max(14, createdDaysAgo - 3);
    const purchasedDaysAgo = createdDaysAgo + 28 + assetIndex * 6;
    const status = resolveAssetStatus(template, userIndex, assetIndex);
    const sequence = userIndex + assetIndex + 1;

    const renewalAt =
      template.billingCycle === BillingCycle.ONCE
        ? null
        : status === AssetStatus.EXPIRED
          ? daysAgo(4 + (sequence % 9))
          : status === AssetStatus.EXPIRING_SOON
            ? daysFromNow(3 + (sequence % 11))
            : daysFromNow(32 + (sequence % 6) * 17);

    const expiresAt =
      template.billingCycle === BillingCycle.ONCE
        ? status === AssetStatus.IN_REPAIR
          ? daysFromNow(28 + assetIndex * 5)
          : daysFromNow(180 + sequence * 9)
        : null;

    return {
      title: template.title,
      type: template.type,
      status,
      vendor: template.vendor,
      reference: buildAssetReference(profile.persona, userIndex, assetIndex),
      billingCycle: template.billingCycle,
      purchasedAt: daysAgo(purchasedDaysAgo, 10),
      assignedAt: daysAgo(assignedDaysAgo, 11),
      renewalAt,
      expiresAt,
      seatCount: template.seatCount ?? null,
      notes: template.notes,
      tags: [...template.tags, profile.team.toLowerCase().replace(/\s+/g, '-')],
      createdAt: daysAgo(createdDaysAgo, 9, 30),
    };
  });
};
