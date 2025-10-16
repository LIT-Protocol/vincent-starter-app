import * as Sentry from '@sentry/node';
import consola from 'consola';
import { ethers } from 'ethers';

import {
  alchemyGasSponsor,
  alchemyGasSponsorApiKey,
  alchemyGasSponsorPolicyId,
  handleOperationExecution,
} from '../utils';
import {
  getErc20ApprovalToolClient,
  getSignedUniswapQuote,
  getUniswapToolClient,
} from './vincentAbilities';
import { env } from '../../../../env';
import {
  BASE_CHAIN_ID,
  BASE_UNISWAP_V3_ROUTER,
  BASE_USDC_ADDRESS,
  BASE_WBTC_ADDRESS,
} from '../constants';
import { JobType } from '../types';

const { BASE_RPC_URL } = env;

const baseProvider = new ethers.providers.StaticJsonRpcProvider(BASE_RPC_URL);

async function addUsdcApproval({
  ethAddress,
  usdcAmount,
}: {
  ethAddress: `0x${string}`;
  usdcAmount: ethers.BigNumber;
}): Promise<`0x${string}` | undefined> {
  const erc20ApprovalToolClient = await getErc20ApprovalToolClient();
  const approvalParams = {
    alchemyGasSponsor,
    alchemyGasSponsorApiKey,
    alchemyGasSponsorPolicyId,
    chainId: BASE_CHAIN_ID,
    rpcUrl: BASE_RPC_URL,
    spenderAddress: BASE_UNISWAP_V3_ROUTER,
    tokenAddress: BASE_USDC_ADDRESS,
    tokenAmount: usdcAmount.mul(5).toString(), // Approve 5x the amount to spend so we don't wait for approval tx's every time we run
  };
  const approvalContext = {
    delegatorPkpEthAddress: ethAddress,
  };

  // Running precheck to prevent sending approval tx if not needed or will fail
  const approvalPrecheckResult = await erc20ApprovalToolClient.precheck(
    approvalParams,
    approvalContext
  );
  if (!approvalPrecheckResult.success) {
    throw new Error(`ERC20 approval tool precheck failed: ${approvalPrecheckResult}`);
  } else if (approvalPrecheckResult.result.alreadyApproved) {
    // No need to send tx, allowance is already at that amount
    return undefined;
  }

  // Sending approval tx
  const approvalExecutionResult = await erc20ApprovalToolClient.execute(
    approvalParams,
    approvalContext
  );
  consola.trace('ERC20 Approval Vincent Tool Response:', approvalExecutionResult);
  if (!approvalExecutionResult.success) {
    throw new Error(`ERC20 approval tool execution failed: ${approvalExecutionResult}`);
  }

  return approvalExecutionResult.result.approvalTxHash as `0x${string}`;
}

async function handleSwapExecution({
  delegatorAddress,
  tokenInAddress,
  tokenInAmount,
  tokenInDecimals,
  tokenOutAddress,
}: {
  delegatorAddress: `0x${string}`;
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

  const uniswapToolClient = await getUniswapToolClient();
  const swapParams = {
    signedUniswapQuote,
    rpcUrlForUniswap: BASE_RPC_URL,
  };
  const swapContext = {
    delegatorPkpEthAddress: delegatorAddress,
  };

  const swapPrecheckResult = await uniswapToolClient.precheck(swapParams, swapContext);
  if (!swapPrecheckResult.success) {
    throw new Error(`Uniswap tool precheck failed: ${swapPrecheckResult}`);
  }

  const swapExecutionResult = await uniswapToolClient.execute(swapParams, swapContext);
  consola.trace('Uniswap Swap Vincent Tool Response:', swapExecutionResult);
  if (!swapExecutionResult.success) {
    throw new Error(`Uniswap tool execution failed: ${swapExecutionResult}`);
  }

  return swapExecutionResult.result.swapTxHash as `0x${string}`;
}

export async function executeDCASwap(job: JobType, sentryScope: Sentry.Scope) {
  const {
    data: {
      pkpInfo: { ethAddress, publicKey },
      purchaseAmount,
    },
  } = job.attrs;

  const _purchaseAmount = ethers.utils.parseUnits(purchaseAmount.toFixed(6), 6);

  const approvalHash = await addUsdcApproval({
    ethAddress: ethAddress as `0x${string}`,
    usdcAmount: _purchaseAmount,
  });
  sentryScope.addBreadcrumb({
    data: {
      approvalHash,
    },
  });

  if (approvalHash) {
    await handleOperationExecution({
      isSponsored: alchemyGasSponsor,
      operationHash: approvalHash,
      pkpPublicKey: publicKey,
      provider: baseProvider,
    });
  }

  const swapHash = await handleSwapExecution({
    delegatorAddress: ethAddress as `0x${string}`,
    tokenInAddress: BASE_USDC_ADDRESS,
    tokenInAmount: _purchaseAmount,
    tokenInDecimals: 6,
    tokenOutAddress: BASE_WBTC_ADDRESS,
  });

  consola.debug(`Successfully purchased ${purchaseAmount} USDC of wBTC at tx hash ${swapHash}`);

  sentryScope.addBreadcrumb({
    data: {
      swapHash,
    },
  });

  return { swapHash };
}
