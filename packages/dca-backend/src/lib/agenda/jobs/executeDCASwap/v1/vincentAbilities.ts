import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility as erc20ApprovalBundledVincentAbility } from '@lit-protocol/vincent-ability-erc20-approval';
import {
  bundledVincentAbility as uniswapSwapBundledVincentAbility,
  getSignedUniswapQuote as getSignedUniswapQuoteAction,
} from '@lit-protocol/vincent-ability-uniswap-swap-v5';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

import { delegateeSigner } from '../utils/signer';

import type { QuoteParams } from '@lit-protocol/vincent-ability-uniswap-swap-v5';

const litNodeClient = new LitNodeClient({
  debug: true,
  litNetwork: 'datil',
});

export async function getSignedUniswapQuote(quoteParams: QuoteParams) {
  // Ensure litNodeClient is connected
  if (!litNodeClient.ready) {
    await litNodeClient.connect();
  }

  return getSignedUniswapQuoteAction({
    litNodeClient,
    quoteParams,
    ethersSigner: delegateeSigner,
  });
}

export async function getErc20ApprovalToolClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: erc20ApprovalBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export async function getUniswapToolClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: uniswapSwapBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}
