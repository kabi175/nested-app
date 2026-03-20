import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import VideoStoryPlayer from '../../components/v2/VideoStoryPlayer';

const PLACEHOLDER =
  'https://res.cloudinary.com/dn6qn2gp8/video/upload/v1773954351/WhatsApp_Video_2026-03-17_at_9.01.57_PM_cf42q1.mp4';

const meta = {
  title: 'v2/VideoStoryPlayer',
  component: VideoStoryPlayer,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
  argTypes: {
    onComplete: { action: 'completed' },
    onSkip: { action: 'skipped' },
  },
} satisfies Meta<typeof VideoStoryPlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Single video — the default placeholder. */
export const Default: Story = {
  args: {
    videos: [PLACEHOLDER],
  },
};

/** Three slides in sequence — tap Skip or wait for each to advance. */
export const MultipleSlides: Story = {
  args: {
    videos: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
  },
};

/** Five slides — stress-tests the progress bar layout. */
export const FiveSlides: Story = {
  args: {
    videos: [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER, PLACEHOLDER],
  },
};
