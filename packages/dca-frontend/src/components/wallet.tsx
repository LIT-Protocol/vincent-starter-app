import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { LogOut, RefreshCcw, Copy, Check, WalletIcon, ArrowDownToLine } from 'lucide-react';

import { useJwtContext } from '@lit-protocol/vincent-app-sdk/react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { WalletModal } from '@/components/wallet-modal';
import { env } from '@/config/env';
import { useChain } from '@/hooks/useChain';

const { VITE_APP_ID } = env;

const formatAddress = (address: string | undefined) => {
  if (!address) return 'Loading...';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const Wallet: React.FC = () => {
  const { chain, provider, usdcContract, wbtcContract } = useChain();
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [usdcBalance, setUsdcBalance] = useState<string>('0');
  const [wbtcBalance, setWbtcBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { authInfo, logOut } = useJwtContext();

  // Function to fetch PKP balances
  const fetchPkpBalance = useCallback(async () => {
    if (!authInfo?.pkp.ethAddress) return;

    try {
      setIsLoadingBalance(true);
      setError(null);

      const [ethBalanceWei, usdcBalance, wbtcBalanceWei] = await Promise.all([
        provider.getBalance(authInfo?.pkp.ethAddress),
        usdcContract.balanceOf(authInfo?.pkp.ethAddress),
        wbtcContract.balanceOf(authInfo?.pkp.ethAddress),
      ]);

      setEthBalance(ethers.utils.formatUnits(ethBalanceWei, 18));
      setUsdcBalance(ethers.utils.formatUnits(usdcBalance, 6));
      setWbtcBalance(ethers.utils.formatUnits(wbtcBalanceWei, 8));

      setIsLoadingBalance(false);
    } catch (err: unknown) {
      console.error('Error fetching PKP balances:', err);
      setError(`Failed to fetch wallet balance`);
      setIsLoadingBalance(false);
    }
  }, [authInfo, provider, usdcContract, wbtcContract]);

  useEffect(() => {
    queueMicrotask(() => fetchPkpBalance());
  }, [fetchPkpBalance]);

  const copyAddress = useCallback(async () => {
    const address = authInfo?.pkp.ethAddress;
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy address to clipboard', err);
    }
  }, [authInfo?.pkp.ethAddress]);

  return (
    <div data-test-id="wallet" className="w-full space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Wallet Address
          </span>
          <div className="flex items-center gap-2">
            <a
              href={`${chain.blockExplorerUrls[0]}/address/${authInfo?.pkp.ethAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline hover:opacity-80"
              title={authInfo?.pkp.ethAddress}
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                color: '#FF4205',
              }}
            >
              {formatAddress(authInfo?.pkp.ethAddress)}
            </a>
            <button
              onClick={copyAddress}
              disabled={!authInfo?.pkp.ethAddress}
              title={copied ? 'Copied!' : 'Copy address'}
              aria-label="Copy wallet address"
              className="p-0 bg-transparent border-none cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <Check className="h-5 w-5" style={{ color: '#FF4205' }} />
              ) : (
                <Copy className="h-5 w-5" style={{ color: '#FF4205' }} />
              )}
            </button>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Network
          </span>
          <a
            href="https://basescan.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 no-underline hover:opacity-80 transition-opacity"
          >
            <img src="/external-logos/base-logo.svg" alt="Base" className="w-4 h-4" />
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-md"
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                backgroundColor: '#0052FF',
                color: 'white',
              }}
            >
              {chain.name}
            </span>
          </a>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/external-logos/eth.svg" alt="ETH" className="w-4 h-4" />
            <span
              className="text-sm font-medium"
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              ETH Balance
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            {isLoadingBalance
              ? 'Loading...'
              : `${parseFloat(ethBalance).toFixed(6)} ${chain.symbol}`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/external-logos/usdc-coin-logo.svg" alt="USDC" className="w-4 h-4" />
            <span
              className="text-sm font-medium"
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              USDC Balance
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            {isLoadingBalance ? 'Loading...' : `${parseFloat(usdcBalance).toFixed(2)} USDC`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/external-logos/wbtc.svg" alt="WBTC" className="w-4 h-4" />
            <span
              className="text-sm font-medium"
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              wBTC Balance
            </span>
          </div>
          <span
            className="text-sm font-medium"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            {isLoadingBalance ? 'Loading...' : `${parseFloat(wbtcBalance).toFixed(6)} WBTC`}
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fff1f0',
            color: '#ff4d4f',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span role="img" aria-label="Error">
            ⚠️
          </span>{' '}
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button className="flex-1 min-w-0" disabled={isLoadingBalance} onClick={fetchPkpBalance}>
          {isLoadingBalance ? (
            <>
              <Spinner variant="destructive" size="sm" />{' '}
              <span className="truncate">Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="flex-shrink-0" />{' '}
              <span className="truncate">Refresh Balance</span>
            </>
          )}
        </Button>
        <Button className="flex-1 min-w-0" onClick={() => setIsModalOpen(true)}>
          <ArrowDownToLine className="flex-shrink-0" /> <span className="truncate">Deposit</span>
        </Button>
        <Button
          className="flex-1 min-w-0"
          onClick={() =>
            window.open(
              `https://dashboard.heyvincent.ai/user/appId/${VITE_APP_ID}/wallet`,
              '_blank'
            )
          }
        >
          <WalletIcon className="flex-shrink-0" /> <span className="truncate">Withdraw</span>
        </Button>
      </div>
      <Button className="w-full" variant="destructive" onClick={logOut}>
        <LogOut className="flex-shrink-0" /> <span className="truncate">Log Out</span>
      </Button>

      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletAddress={authInfo?.pkp.ethAddress}
      />
    </div>
  );
};
