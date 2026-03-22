import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import GoalValueCard from '../../components/v2/GoalValueCard';

const meta = {
  title: 'v2/GoalValueCard',
  component: GoalValueCard,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#fff', flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    currentFundValue: { control: 'number' },
    investedAmount: { control: 'number' },
    goalAmount: { control: 'number' },
    onPress: { action: 'pressed' },
  },
} satisfies Meta<typeof GoalValueCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** ~50% of goal reached — both fills visible on the track. */
export const HalfwayThere: Story = {
  args: {
    currentFundValue: 140000,
    investedAmount: 120000,
    goalAmount: 300000,
  },
};

/** Goal fully funded — both fills at 100%. */
export const GoalReached: Story = {
  args: {
    currentFundValue: 300000,
    investedAmount: 280000,
    goalAmount: 300000,
  },
};

/** Just started investing — fills are barely visible. */
export const EarlyStage: Story = {
  args: {
    currentFundValue: 5000,
    investedAmount: 5000,
    goalAmount: 500000,
  },
};

/** Zero invested — empty track, shows ₹0 values. */
export const Empty: Story = {
  args: {
    currentFundValue: 0,
    investedAmount: 0,
    goalAmount: 1000000,
  },
};

/** Large corpus goal (crore range) — verifies compact formatting on goal label. */
export const LargeGoal: Story = {
  args: {
    currentFundValue: 3200000,
    investedAmount: 2800000,
    goalAmount: 10000000,
  },
};
