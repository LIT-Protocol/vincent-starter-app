import React, { useState, FormEvent } from 'react';

import { useBackend } from '@/hooks/useBackend';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_VALUE, InputAmount } from '@/components/input-amount';
import { FREQUENCIES, SelectFrequency } from '@/components/select-frequency';

export interface CreateDCAProps {
  onCreate?: () => void;
}

export const CreateDCA: React.FC<CreateDCAProps> = ({ onCreate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [name] = useState<string>('name');
  const [purchaseAmount, setPurchaseAmount] = useState<string>(DEFAULT_VALUE);
  const [frequency, setFrequency] = useState<string>(FREQUENCIES[0].value);
  const { createDCA } = useBackend();

  const handleCreateDCA = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!purchaseAmount || Number(purchaseAmount) <= 0) {
      alert('Please enter a positive DCA amount.');
      return;
    }
    if (!frequency) {
      alert('Please select a frequency.');
      return;
    }

    try {
      setLoading(true);
      await createDCA({
        name,
        purchaseAmount,
        purchaseIntervalHuman: frequency,
      });
      onCreate?.();
    } catch (error) {
      console.error('Error creating DCA:', error);
      alert('Error creating DCA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between">
      <form onSubmit={handleCreateDCA}>
        <div className="text-center space-y-6">
          <div className="space-y-4 text-left bg-orange-50/60 p-4 rounded-lg border border-orange-100">
            <h3
              className="text-sm font-semibold"
              style={{
                fontFamily: 'Poppins, system-ui, sans-serif',
                color: '#FF4205',
              }}
            >
              How It Works (Powered by Vincent)
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              This DCA agent automatically purchases wBTC with a specific amount of USDC on your
              predefined schedule.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              Typically, building automated crypto spending agents involves trusting agent
              developers or wallet SaaS companies for <strong>key management</strong>. Vincent
              enables a more secure and simpler process.
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
                color: 'var(--footer-text-color, #121212)',
              }}
            >
              The agent operates using permissions securely delegated by you, following strict rules
              you establish during setup—such as authorized abilities. These onchain rules are
              cryptographically enforced by{' '}
              <a
                href="https://litprotocol.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
                style={{ color: '#FF4205' }}
              >
                Lit Protocol
              </a>
              , ensuring every action stays within your guardrails. With Vincent, you achieve
              powerful automation combined with secure, permissioned execution.
            </p>
          </div>

          <div
            className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-lg text-left"
            style={{
              fontFamily: '"Encode Sans Semi Expanded", system-ui, sans-serif',
              color: 'var(--footer-text-color, #121212)',
            }}
          >
            <strong style={{ fontFamily: 'Poppins, system-ui, sans-serif' }}>Note:</strong> Ensure
            your wallet holds sufficient Base ETH for the app to function smoothly.
          </div>
        </div>

        <Separator className="my-8" />

        <div className="my-8">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1 min-w-0">
              <InputAmount
                required
                value={purchaseAmount}
                onChange={setPurchaseAmount}
                disabled={loading}
              />
            </div>

            <div className="flex-1 min-w-0">
              <SelectFrequency
                required
                value={frequency}
                onChange={setFrequency}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="sm:flex-shrink-0 whitespace-nowrap"
            >
              Create DCA →
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
