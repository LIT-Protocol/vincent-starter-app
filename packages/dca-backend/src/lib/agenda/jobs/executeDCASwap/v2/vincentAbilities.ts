import { npxImport } from 'npx-import';

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

import { delegateeSigner } from '../utils/signer';

import type { QuoteParams } from '@lit-protocol/vincent-ability-uniswap-swap-v8';

type UniswapAbility = typeof import('@lit-protocol/vincent-ability-uniswap-swap-v8');

const litNodeClient = new LitNodeClient({
  debug: true,
  litNetwork: 'datil',
});

const UNISWAP_PKG_VER = '8.0.0';

export async function getSignedUniswapQuote(
  quoteParams: QuoteParams
): Promise<ReturnType<typeof getSignedUniswapQuoteAction>> {
  // Ensure litNodeClient is connected
  if (!litNodeClient.ready) {
    await litNodeClient.connect();
  }

  const { getSignedUniswapQuote: getSignedUniswapQuoteAction } = await npxImport<UniswapAbility>(
    `@lit-protocol/vincent-ability-uniswap-swap@${UNISWAP_PKG_VER}`
  );

  return getSignedUniswapQuoteAction({
    litNodeClient,
    quoteParams,
    ethersSigner: delegateeSigner,
  });
}

export async function getUniswapAbilityClient() {
  const { bundledVincentAbility: uniswapSwapBundledVincentAbility } =
    await npxImport<UniswapAbility>(`@lit-protocol/vincent-uniswap-swap@${UNISWAP_PKG_VER}`);

  return getVincentAbilityClient({
    bundledVincentAbility: uniswapSwapBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}
