import * as Sentry from '@sentry/node';
import consola from 'consola';
import { ethers } from 'ethers';

import { AbilityAction } from '@lit-protocol/vincent-ability-uniswap-swap-v8';

import {
  alchemyGasSponsor,
  alchemyGasSponsorApiKey,
  alchemyGasSponsorPolicyId,
  handleOperationExecution,
} from '../utils';
import { getSignedUniswapQuote, getUniswapAbilityClient } from './vincentAbilities';
import { env } from '../../../../env';
import { BASE_USDC_ADDRESS, BASE_WBTC_ADDRESS } from '../constants';
import { JobType } from '../types';

const { BASE_RPC_URL } = env;

const baseProvider = new ethers.providers.StaticJsonRpcProvider(BASE_RPC_URL);

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

  const uniswapToolClient = await getUniswapAbilityClient();
  const swapContext = {
    delegatorPkpEthAddress: delegatorAddress,
  };

  const approveParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    signedUniswapQuote,
    action: 'approve' as const,
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
  const operationHash = (result.swapTxUserOperationHash || result.swapTxHash) as `0x${string}`;

  return operationHash;
}

export async function executeDCASwap(job: JobType, sentryScope: Sentry.Scope) {
  const {
    data: {
      pkpInfo: { ethAddress, publicKey },
      purchaseAmount,
    },
  } = job.attrs;

  const _purchaseAmount = ethers.utils.parseUnits(purchaseAmount.toFixed(6), 6);
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

  consola.debug(`Successfully purchased ${purchaseAmount} USDC of wBTC at tx hash ${swapHash}`);

  sentryScope.addBreadcrumb({
    data: {
      swapHash,
    },
  });

  return { swapHash };
}
