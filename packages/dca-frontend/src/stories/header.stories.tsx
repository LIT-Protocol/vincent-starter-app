import type { Meta, StoryObj } from '@storybook/react';
import { Wallet } from 'lucide-react';
import { Header } from '../components/ui/header';
import { Button } from '../components/ui/button';

const meta: Meta<typeof Header> = {
  title: 'UI/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A header component with logo, title, and optional right-side buttons.',
      },
    },
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'The title text to display in the header',
    },
    rightButton: {
      control: false,
      description: 'Optional additional buttons or content to display on the right side',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {
    title: 'Vincent DCA',
  },
};

export const WithRightButtons: Story = {
  args: {
    title: 'Vincent DCA',
    rightButton: (
      <>
        <Button variant="secondary-outline" size="sm" className="px-2 sm:px-3">
          Log Out
        </Button>
        <Button variant="secondary-outline" size="sm" className="px-2 sm:px-3">
          <Wallet className="w-4 h-4" />
        </Button>
      </>
    ),
  },
};
