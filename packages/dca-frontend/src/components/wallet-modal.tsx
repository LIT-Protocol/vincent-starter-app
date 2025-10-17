import React, { useState } from 'react';
import { Copy, Info } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | undefined;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, walletAddress }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !walletAddress) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2
            className="text-lg font-medium text-center"
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Your Agent Wallet
          </h2>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-4">
          {/* QR Code with Orange styling and logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-orange-50/60 p-3 rounded-lg">
                <div className="flex items-center justify-center relative w-32 h-32">
                  <QRCode
                    value={walletAddress}
                    size={96}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    viewBox="0 0 96 96"
                    level="H"
                    fgColor="#FF4205"
                    bgColor="#ffffff"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full flex items-center justify-center shadow-sm p-1 w-6 h-6">
                      <img
                        src="/vincent-logo-orange.svg"
                        alt="Vincent"
                        className="object-contain w-4 h-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address below QR code */}
            <p
              className="text-xs font-mono break-all px-2"
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              {walletAddress}
            </p>
          </div>

          {/* Copy Button */}
          <div className="flex justify-center">
            <Button
              variant="secondary-outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-1/2 border-orange-200 hover:bg-orange-50"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Address'}
            </Button>
          </div>

          <p
            className="text-center text-sm"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            Bridge from any chain using{' '}
            <a
              href={`https://app.debridge.finance/?r=32300&address=${walletAddress}&inputChain=&outputChain=8453&inputCurrency=&outputCurrency=0x833589fcd6edb6e08f4c7c32d4f71b54bda02913&dlnMode=simple`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-baseline gap-0.5 underline hover:opacity-80"
              style={{ color: '#FF4205' }}
              title="deBridge"
            >
              <Info className="w-4 h-4" style={{ position: 'relative', top: '2px' }} />
              deBridge
            </a>
            .
          </p>
        </div>

        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 flex justify-center">
          <Button variant="secondary-outline" size="sm" onClick={onClose} className="w-1/2">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
