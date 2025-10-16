import { ethers } from 'ethers';

import { env } from '../../../../env';
import { waitForTransaction } from '../utils/wait-for-transaction';
import { waitForUserOperation } from '../utils/wait-for-user-operation';

const { DEFAULT_TX_CONFIRMATIONS } = env;

export async function handleOperationExecution({
  confirmations = DEFAULT_TX_CONFIRMATIONS,
  isSponsored,
  operationHash,
  pkpPublicKey,
  provider,
}: {
  confirmations?: number;
  isSponsored: boolean;
  operationHash: `0x${string}`;
  pkpPublicKey: string;
  provider: ethers.providers.JsonRpcProvider;
}): Promise<{ txHash: `0x${string}`; useropHash: `0x${string}` | undefined }> {
  let txHash;
  let useropHash;
  if (!isSponsored) {
    txHash = operationHash;
  } else {
    useropHash = operationHash;
    txHash = await waitForUserOperation({
      pkpPublicKey,
      provider,
      useropHash,
    });
    await waitForTransaction({ confirmations, provider, transactionHash: txHash });
  }

  return { txHash, useropHash };
}
