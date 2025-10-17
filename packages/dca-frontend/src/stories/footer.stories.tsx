import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '@/components/ui/footer';

const meta: Meta<typeof Footer> = {
  title: 'UI/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a1a' }],
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
};
