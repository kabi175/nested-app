import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import OnboardingScreen from '../../components/v2/OnboardingScreen';

const meta = {
  title: 'v2/OnboardingScreen',
  component: OnboardingScreen,
  tags: ['autodocs'],
  /** Full-screen decorator — onboarding is meant to cover the whole display */
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onSkip: { action: 'skipped' },
    onFinish: { action: 'finished' },
  },
} satisfies Meta<typeof OnboardingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

/** Full interactive flow — swipe through all 3 slides. */
export const Default: Story = {
  args: {},
};

/** Callbacks wired to Storybook actions panel for skip/finish inspection. */
export const WithActions: Story = {
  args: {
    onSkip: undefined,
    onFinish: undefined,
  },
};
