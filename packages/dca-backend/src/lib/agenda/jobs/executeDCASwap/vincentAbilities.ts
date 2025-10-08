import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  bundledVincentAbility as uniswapSwapBundledVincentAbility,
  getSignedUniswapQuote as getSignedUniswapQuoteAction,
  QuoteParams,
} from '@lit-protocol/vincent-ability-uniswap-swap';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

import { delegateeSigner } from './utils/signer';

const litNodeClient = new LitNodeClient({
  debug: true,
  litNetwork: 'datil',
});

export async function getSignedUniswapQuote(
  quoteParams: QuoteParams
): Promise<ReturnType<typeof getSignedUniswapQuoteAction>> {
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

export function getUniswapAbilityClient() {
  return getVincentAbilityClient({
    bundledVincentAbility: uniswapSwapBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}
