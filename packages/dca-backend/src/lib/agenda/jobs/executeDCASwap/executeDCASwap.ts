import * as Sentry from '@sentry/node';
import { Job } from '@whisthub/agenda';
import consola from 'consola';
import { ethers } from 'ethers';

import { IRelayPKP } from '@lit-protocol/types';
import { AbilityAction } from '@lit-protocol/vincent-ability-uniswap-swap';

import { type AppData, assertPermittedVersion } from '../jobVersion';
import {
  alchemyGasSponsor,
  alchemyGasSponsorApiKey,
  alchemyGasSponsorPolicyId,
  balanceOf,
  getERC20Contract,
  getUserPermittedVersion,
  handleOperationExecution,
} from './utils';
import { getSignedUniswapQuote, getUniswapAbilityClient } from './vincentAbilities';
import { env } from '../../../env';
import { normalizeError } from '../../../error';
import { PurchasedCoin } from '../../../mongo/models/PurchasedCoin';

export type JobType = Job<JobParams>;
export type JobParams = {
  app: AppData;
  name: string;
  pkpInfo: IRelayPKP;
  purchaseAmount: number;
  purchaseIntervalHuman: string;
  updatedAt: Date;
};

const { BASE_RPC_URL, VINCENT_APP_ID } = env;

const BASE_USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const BASE_WBTC_ADDRESS = '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c';

const baseProvider = new ethers.providers.StaticJsonRpcProvider(BASE_RPC_URL);
const usdcContract = getERC20Contract(BASE_USDC_ADDRESS, baseProvider);

async function handleSwapExecution({
  delegatorAddress,
  pkpPublicKey,
  tokenInAddress,
  tokenInAmount,
  tokenInDecimals,
  tokenOutAddress,
}: {
  delegatorAddress: `0x${string}`;
  pkpPublicKey: `0x${string}`;
  tokenInAddress: `0x${string}`;
  tokenInAmount: ethers.BigNumber;
  tokenInDecimals: number;
  tokenOutAddress: `0x${string}`;
}): Promise<`0x${string}`> {
  const signedUniswapQuote = await getSignedUniswapQuote({
    tokenInAddress,
    tokenOutAddress,
    recipient: delegatorAddress,
    rpcUrl: BASE_RPC_URL,
    tokenInAmount: ethers.utils.formatUnits(tokenInAmount, tokenInDecimals),
  });

  const uniswapToolClient = getUniswapAbilityClient();
  const swapContext = {
    delegatorPkpEthAddress: delegatorAddress,
  };

  const approveParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    signedUniswapQuote,
    action: AbilityAction.Approve as 'approve',
    rpcUrlForUniswap: BASE_RPC_URL,
  };

  const approvePrecheckResult = await uniswapToolClient.precheck(approveParams, swapContext);
  consola.trace('Uniswap Approve Precheck Response:', approvePrecheckResult);
  if (!approvePrecheckResult.success) {
    throw new Error(`Uniswap approve precheck failed: ${approvePrecheckResult.result?.reason}`);
  }

  const approveExecutionResult = await uniswapToolClient.execute(approveParams, swapContext);
  consola.trace('Uniswap Approve Vincent Tool Response:', approveExecutionResult);
  if (approveExecutionResult.success === false) {
    throw new Error(`Uniswap tool approval failed: ${approveExecutionResult.runtimeError}`);
  }

  const approveResult = approveExecutionResult.result!;
  const approveOperationHash = (approveResult.approvalTxUserOperationHash ||
    approveResult.approvalTxHash) as `0x${string}` | undefined;

  if (approveOperationHash) {
    consola.debug('Waiting for approval transaction to be mined...');
    await handleOperationExecution({
      pkpPublicKey,
      isSponsored: alchemyGasSponsor,
      operationHash: approveOperationHash,
      provider: baseProvider,
    });
    consola.debug('Approval transaction mined successfully');
  } else {
    consola.debug('Approval already sufficient, no transaction needed');
  }

  const swapParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    signedUniswapQuote,
    action: AbilityAction.Swap as 'swap',
    rpcUrlForUniswap: BASE_RPC_URL,
  };

  const swapPrecheckResult = await uniswapToolClient.precheck(swapParams, swapContext);
  consola.trace('Uniswap Swap Precheck Response:', swapPrecheckResult);
  if (!swapPrecheckResult.success) {
    throw new Error(`Uniswap swap precheck failed: ${swapPrecheckResult.result?.reason}`);
  }

  const swapExecutionResult = await uniswapToolClient.execute(swapParams, swapContext);
  consola.trace('Uniswap Swap Vincent Tool Response:', swapExecutionResult);
  if (swapExecutionResult.success === false) {
    throw new Error(`Uniswap tool execution failed: ${swapExecutionResult.runtimeError}`);
  }

  const result = swapExecutionResult.result!;
  const operationHash = (result.swapTxUserOperationHash ||
    result.swapTxHash) as `0x${string}`;

  return operationHash;
}

export async function executeDCASwap(job: JobType, sentryScope: Sentry.Scope): Promise<void> {
  try {
    const {
      _id,
      data: {
        app,
        pkpInfo: { ethAddress, publicKey },
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
    const appVersionToRun = assertPermittedVersion(app.version, userPermittedAppVersion);
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

    const swapOperationHash = await handleSwapExecution({
      delegatorAddress: ethAddress as `0x${string}`,
      pkpPublicKey: publicKey as `0x${string}`,
      tokenInAddress: BASE_USDC_ADDRESS,
      tokenInAmount: _purchaseAmount,
      tokenInDecimals: 6,
      tokenOutAddress: BASE_WBTC_ADDRESS,
    });

    const { txHash: swapHash } = await handleOperationExecution({
      isSponsored: alchemyGasSponsor,
      operationHash: swapOperationHash,
      pkpPublicKey: publicKey,
      provider: baseProvider,
    });

    sentryScope.addBreadcrumb({
      data: {
        swapHash,
      },
    });

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

    consola.debug(`Successfully purchased ${purchaseAmount} USDC of wBTC at tx hash ${swapHash}`);
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
