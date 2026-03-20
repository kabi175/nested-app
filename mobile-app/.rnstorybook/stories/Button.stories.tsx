import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import Button from '../../components/v2/Button';

const meta = {
  title: 'v2/Button',
  component: Button,
  tags: ['autodocs'],
  /** Wrap every story in a padded container so the button isn't edge-to-edge */
  decorators: [
    (Story) => (
      <View style={{ padding: 24, backgroundColor: '#fff', flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    // Default args shared across all stories
    title: 'Send OTP',
    onPress: () => { },
  },
  argTypes: {
    onPress: { action: 'pressed' },
    title: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

/** The default, interactive state. */
export const Normal: Story = {
  args: {
    title: 'Send OTP',
    disabled: false,
    loading: false,
  },
};

/** Un-tappable lavender style — shown when an action is not yet available. */
export const Disabled: Story = {
  args: {
    title: 'Send OTP',
    disabled: true,
  },
};

/** Spinner replaces the label while an async action is in-flight. */
export const Loading: Story = {
  args: {
    title: 'Send OTP',
    loading: true,
  },
};

/** Verifies the label stays on a single line and doesn't overflow. */
export const LongLabel: Story = {
  args: {
    title: 'Verify & Send One-Time Password',
    disabled: false,
  },
};
