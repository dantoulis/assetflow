import type { User } from '../../src/generated/prisma/client';
import { AssetRequestStatus, AssetType } from '../../src/generated/prisma/enums';
import { daysAgo } from './helpers';
import type { SeededUser } from './users';

interface AssetRequestScenario {
  requesterIndex: number;
  title: string;
  assetType: AssetType;
  vendor?: string;
  justification: string;
  status: AssetRequestStatus;
  createdDaysAgo: number;
  reviewLagDays?: number;
  rejectionReason?: string;
}

const requestScenarios: AssetRequestScenario[] = [
  {
    requesterIndex: 0,
    title: 'Need a lighter travel laptop for conference workshops',
    assetType: AssetType.LAPTOP,
    vendor: 'Apple',
    justification:
      'I am travelling to two partner workshops next month and need a lighter device for demos and note taking on the road.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 3,
  },
  {
    requesterIndex: 1,
    title: 'Requesting an extra Figma seat for design QA',
    assetType: AssetType.LICENSE,
    vendor: 'Figma',
    justification:
      'We added a contractor for design QA this sprint and need a seat to review prototypes and dev-ready screens.',
    status: AssetRequestStatus.FULFILLED,
    createdDaysAgo: 61,
    reviewLagDays: 3,
  },
  {
    requesterIndex: 2,
    title: 'Need LinkedIn Sales Navigator for outbound campaign research',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'LinkedIn',
    justification:
      'Our next outbound sequence depends on account-level research and intent signals that are only available in Sales Navigator.',
    status: AssetRequestStatus.APPROVED,
    createdDaysAgo: 14,
    reviewLagDays: 2,
  },
  {
    requesterIndex: 3,
    title: 'Asking for a second laptop for occasional warehouse visits',
    assetType: AssetType.LAPTOP,
    vendor: 'Lenovo',
    justification:
      'I occasionally work from the warehouse during inventory counts and thought a spare device there would help.',
    status: AssetRequestStatus.REJECTED,
    createdDaysAgo: 22,
    reviewLagDays: 1,
    rejectionReason:
      'Rejected because the request did not require a permanently assigned second laptop. A shared device is already available on site.',
  },
  {
    requesterIndex: 4,
    title: 'Need a new noise-cancelling headset for onboarding calls',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Jabra',
    justification:
      'My current headset drops audio during back-to-back onboarding sessions and it is starting to affect customer call quality.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 5,
  },
  {
    requesterIndex: 5,
    title: 'Requesting a second 27-inch monitor for pair programming',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Dell',
    justification:
      'The current desk setup is cramped when pairing on incidents. A second monitor would make debugging and log review much faster.',
    status: AssetRequestStatus.FULFILLED,
    createdDaysAgo: 48,
    reviewLagDays: 4,
  },
  {
    requesterIndex: 6,
    title: 'Need an Adobe Stock add-on for launch creative',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'Adobe',
    justification:
      'The launch campaign needs licensed imagery and motion assets that are not covered by the current Creative Cloud plan.',
    status: AssetRequestStatus.APPROVED,
    createdDaysAgo: 12,
    reviewLagDays: 2,
  },
  {
    requesterIndex: 7,
    title: 'Requesting a finance reporting add-on for monthly close',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'Xero',
    justification:
      'The current plan does not expose the consolidated reporting views we need for monthly close and budget reviews.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 8,
  },
  {
    requesterIndex: 8,
    title: 'Need a Meta Ads reporting seat for paid acquisition',
    assetType: AssetType.LICENSE,
    vendor: 'Meta',
    justification:
      'The paid acquisition handoff requires direct access to campaign breakdowns and pacing data during the next two launches.',
    status: AssetRequestStatus.REJECTED,
    createdDaysAgo: 31,
    reviewLagDays: 3,
    rejectionReason:
      'Rejected because the existing shared reporting dashboard already covers the required visibility and no new paid seat is needed.',
  },
  {
    requesterIndex: 9,
    title: 'Need a replacement headset for service desk shifts',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Poly',
    justification:
      'The current headset has intermittent mic cut-outs, which is causing call quality complaints during service desk coverage.',
    status: AssetRequestStatus.FULFILLED,
    createdDaysAgo: 27,
    reviewLagDays: 2,
  },
  {
    requesterIndex: 10,
    title: 'Requesting an additional dbt Cloud development seat',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'dbt',
    justification:
      'We are splitting modeling ownership this quarter and need one more development seat to separate release work from analysis work.',
    status: AssetRequestStatus.APPROVED,
    createdDaysAgo: 18,
    reviewLagDays: 3,
  },
  {
    requesterIndex: 11,
    title: 'Need Salesforce sandbox access for deal desk testing',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'Salesforce',
    justification:
      'The sales operations playbook needs a safe sandbox to test routing changes before we touch live opportunities.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 6,
  },
  {
    requesterIndex: 2,
    title: 'Requesting a webinar add-on for monthly product launches',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'Zoom',
    justification:
      'The growth team is running a webinar every month and the standard meeting plan is no longer enough for registration flows.',
    status: AssetRequestStatus.FULFILLED,
    createdDaysAgo: 55,
    reviewLagDays: 3,
  },
  {
    requesterIndex: 4,
    title: 'Need a spare laptop for temporary onboarding support',
    assetType: AssetType.LAPTOP,
    vendor: 'Apple',
    justification:
      'We are backfilling onboarding coverage for two weeks and need a temporary laptop to bring the contractor online quickly.',
    status: AssetRequestStatus.APPROVED,
    createdDaysAgo: 11,
    reviewLagDays: 1,
  },
  {
    requesterIndex: 6,
    title: 'Requesting an iPad for sketch reviews',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Apple',
    justification:
      'It would be useful for annotation during workshops, but it is not tied to a current launch commitment.',
    status: AssetRequestStatus.REJECTED,
    createdDaysAgo: 36,
    reviewLagDays: 2,
    rejectionReason:
      'Rejected because the current design stack already covers review needs and the request is not tied to an approved project requirement.',
  },
  {
    requesterIndex: 7,
    title: 'Need a document scanner for invoice batches',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Fujitsu',
    justification:
      'We still receive a small batch of paper invoices each month and a dedicated scanner would speed up intake and reconciliation.',
    status: AssetRequestStatus.FULFILLED,
    createdDaysAgo: 44,
    reviewLagDays: 2,
  },
  {
    requesterIndex: 10,
    title: 'Requesting a second monitor for dashboard reviews',
    assetType: AssetType.PERIPHERAL,
    vendor: 'Dell',
    justification:
      'The analytics team is doing more dashboard QA and it is difficult to validate changes on a single-screen setup.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 4,
  },
  {
    requesterIndex: 1,
    title: 'Need a Miro enterprise seat for roadmap workshops',
    assetType: AssetType.SUBSCRIPTION,
    vendor: 'Miro',
    justification:
      'We are consolidating roadmap workshops into one space and need an enterprise seat for facilitation and export permissions.',
    status: AssetRequestStatus.PENDING,
    createdDaysAgo: 9,
  },
];

const findFulfilledAssetId = (user: SeededUser, assetType: AssetType) => {
  const exactMatch = user.assets.find((asset) => asset.type === assetType);

  return exactMatch?.id ?? user.assets[0]?.id ?? null;
};

export const buildAssetRequestSeeds = (admin: User, users: SeededUser[]) => {
  return requestScenarios.map((scenario) => {
    const requester = users[scenario.requesterIndex]!;
    const reviewedAt =
      scenario.status === AssetRequestStatus.PENDING
        ? undefined
        : daysAgo(Math.max(1, scenario.createdDaysAgo - (scenario.reviewLagDays ?? 2)), 15, 30);

    return {
      requesterId: requester.id,
      reviewedById: scenario.status === AssetRequestStatus.PENDING ? null : admin.id,
      fulfilledAssetId:
        scenario.status === AssetRequestStatus.FULFILLED
          ? findFulfilledAssetId(requester, scenario.assetType)
          : null,
      title: scenario.title,
      assetType: scenario.assetType,
      vendor: scenario.vendor ?? null,
      justification: scenario.justification,
      rejectionReason: scenario.rejectionReason ?? null,
      status: scenario.status,
      createdAt: daysAgo(scenario.createdDaysAgo, 10, 15),
      reviewedAt,
    };
  });
};
