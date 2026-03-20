import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import SplashScreen from '../../components/v2/SplashScreen';

const meta = {
  title: 'v2/SplashScreen',
  component: SplashScreen,
  tags: ['autodocs'],
  /** Full-screen decorator — the splash is meant to cover the whole display */
  decorators: [
    (Story) => (
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onFinish: { action: 'finished' },
  },
} satisfies Meta<typeof SplashScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Stories ──────────────────────────────────────────────────────────────────

/** Default entry animation — logo springs in, holds, then fades out. */
export const Default: Story = {
  args: {
    onFinish: undefined,
  },
};

/** Static preview — no `onFinish` callback so the screen stays visible. */
export const Static: Story = {
  args: {
    onFinish: undefined,
  },
};
