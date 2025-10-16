import { npxImport } from 'npx-import';

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

import { delegateeSigner } from '../utils/signer';

import type { QuoteParams } from '@lit-protocol/vincent-ability-uniswap-swap-v5';

type Erc20Ability = typeof import('@lit-protocol/vincent-ability-erc20-approval');
type UniswapAbility = typeof import('@lit-protocol/vincent-ability-uniswap-swap-v5');

const litNodeClient = new LitNodeClient({
  debug: true,
  litNetwork: 'datil',
});

export async function getSignedUniswapQuote(quoteParams: QuoteParams) {
  // Ensure litNodeClient is connected
  if (!litNodeClient.ready) {
    await litNodeClient.connect();
  }

  const { getSignedUniswapQuote: getSignedUniswapQuoteAction } = await npxImport<UniswapAbility>(
    '@lit-protocol/vincent-ability-uniswap-swap@5.0.0'
  );

  return getSignedUniswapQuoteAction({
    litNodeClient,
    quoteParams,
    ethersSigner: delegateeSigner,
  });
}

export async function getErc20ApprovalToolClient() {
  const { bundledVincentAbility: erc20ApprovalBundledVincentAbility } =
    await npxImport<Erc20Ability>('@lit-protocol/vincent-ability-erc20-approval');

  return getVincentAbilityClient({
    bundledVincentAbility: erc20ApprovalBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export async function getUniswapToolClient() {
  const { bundledVincentAbility: uniswapSwapBundledVincentAbility } =
    await npxImport<UniswapAbility>('@lit-protocol/vincent-uniswap-swap-v5');
  return getVincentAbilityClient({
    bundledVincentAbility: uniswapSwapBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}
