import type { Meta, StoryObj } from '@storybook/react';
import { WalletModal } from './wallet-modal';

const meta: Meta<typeof WalletModal> = {
  title: 'UI/WalletModal',
  component: WalletModal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A modal component for displaying wallet information including QR code and address.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: { type: 'boolean' },
      description: 'Controls whether the modal is visible',
    },
    walletAddress: {
      control: { type: 'text' },
      description: 'The wallet address to display',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when the modal is closed',
    },
  },
};

export default meta;
type Story = StoryObj<typeof WalletModal>;

export const Default: Story = {
  args: {
    isOpen: true,
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE06',
    onClose: () => {},
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bE06',
    onClose: () => {},
  },
};

export const LongAddress: Story = {
  args: {
    isOpen: true,
    walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    onClose: () => {},
  },
};
