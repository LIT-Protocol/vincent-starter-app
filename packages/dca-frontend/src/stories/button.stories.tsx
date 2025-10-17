import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  render: (args) => <Button {...args}>Button</Button>,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const PrimaryOutline: Story = {
  args: {
    variant: 'primary-outline',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const SecondaryOutline: Story = {
  args: {
    variant: 'secondary-outline',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
};

export const DestructiveOutline: Story = {
  args: {
    variant: 'destructive-outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};
