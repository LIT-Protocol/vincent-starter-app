import * as Sentry from '@sentry/node';
import { Job } from '@whisthub/agenda';

import { IRelayPKP } from '@lit-protocol/types';

export type JobType = Job<JobParams>;
export type AppData = {
  id: number;
  version: number;
};
export type JobParams = {
  app: AppData;
  name: string;
  pkpInfo: IRelayPKP;
  purchaseAmount: number;
  purchaseIntervalHuman: string;
  updatedAt: Date;
};

export type JobHandler = (
  job: JobType,
  sentryScope: Sentry.Scope
) => Promise<{ swapHash: `0x${string}` }>;

export type SupportedJobVersions = 1 | 2;
