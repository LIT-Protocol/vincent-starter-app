import * as Sentry from '@sentry/node';
import consola from 'consola';
import { ethers } from 'ethers';

import { BASE_USDC_ADDRESS, BASE_WBTC_ADDRESS } from './constants';
import { assertPermittedVersion } from './jobVersion';
import { JobHandler, JobType, SupportedJobVersions } from './types';
import { balanceOf, getERC20Contract, getUserPermittedVersion } from './utils';
import { processJob as executeDCASwapV1 } from './v1';
import { processJob as executeDCASwapV2 } from './v2';
import { env } from '../../../env';
import { normalizeError } from '../../../error';
import { PurchasedCoin } from '../../../mongo/models/PurchasedCoin';

export const jobName = 'execute-swap';

const { BASE_RPC_URL, VINCENT_APP_ID } = env;

const baseProvider = new ethers.providers.StaticJsonRpcProvider(BASE_RPC_URL);
const usdcContract = getERC20Contract(BASE_USDC_ADDRESS, baseProvider);

const jobHandlerByApiVersion: Record<SupportedJobVersions, JobHandler> = {
  1: executeDCASwapV1,
  2: executeDCASwapV2,
};

export async function processJob(job: JobType, sentryScope: Sentry.Scope) {
  try {
    const {
      _id,
      data: {
        app,
        pkpInfo: { ethAddress },
        purchaseAmount,
      },
    } = job.attrs;

    consola.log('Starting DCA swap job...', {
      _id,
      ethAddress,
      purchaseAmount,
    });

    consola.debug('Fetching user USDC balance...');
    const [usdcBalance, userPermittedAppVersion] = await Promise.all([
      balanceOf(usdcContract, ethAddress),
      getUserPermittedVersion({ ethAddress, appId: VINCENT_APP_ID }),
    ]);

    sentryScope.addBreadcrumb({
      data: {
        usdcBalance,
      },
      message: 'User USDC balance',
    });

    const _purchaseAmount = ethers.utils.parseUnits(purchaseAmount.toFixed(6), 6);
    if (usdcBalance.lt(_purchaseAmount)) {
      throw new Error(
        `Not enough balance for account ${ethAddress} - please fund this account with USDC to DCA`
      );
    }
    if (!userPermittedAppVersion) {
      throw new Error(
        `User ${ethAddress} revoked permission to run this app. Used version to generate: ${app.version}`
      );
    }

    // Run the saved version or update to the currently permitted one if version is compatible
    const { jobAPIVersion, userPermittedVersion: appVersionToRun } = assertPermittedVersion(
      app.version,
      userPermittedAppVersion
    );
    sentryScope.addBreadcrumb({
      data: {
        app,
        appVersionToRun,
        userPermittedAppVersion,
      },
    });

    if (appVersionToRun !== app.version) {
      // User updated the permitted app version after creating the job, so we need to update it
      // eslint-disable-next-line no-param-reassign
      job.attrs.data.app = { ...job.attrs.data.app, version: appVersionToRun };
      await job.save();
    }

    consola.log('Job details', {
      ethAddress,
      purchaseAmount,
      userPermittedAppVersion,
      usdcBalance: ethers.utils.formatUnits(usdcBalance, 6),
    });

    if (!(jobAPIVersion in jobHandlerByApiVersion)) {
      throw new Error(`Unknown job api version ${jobAPIVersion}`);
    }

    const { swapHash } = await jobHandlerByApiVersion[jobAPIVersion](job, sentryScope);

    // Create a purchase record with all required fields
    const purchase = new PurchasedCoin({
      ethAddress,
      coinAddress: BASE_WBTC_ADDRESS,
      name: 'wBTC',
      purchaseAmount: purchaseAmount.toFixed(2),
      scheduleId: _id,
      symbol: 'wBTC',
      txHash: swapHash,
    });
    await purchase.save();
  } catch (e) {
    // Catch-and-rethrow is usually an antipattern, but Agenda doesn't log failed job reasons to console
    // so this is our chance to log the job failure details using Consola before we throw the error
    // to Agenda, which will write the failure reason to the Agenda job document in Mongo
    const err = normalizeError(e);
    sentryScope.captureException(err);
    consola.error(err.message, err.stack);
    throw e;
  }
}
