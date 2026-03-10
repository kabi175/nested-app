import type { Meta, StoryObj } from '@storybook/react';
import BuildingNestScreen from '../../components/v2/BuildingNestScreen';

const meta = {
    title: 'v2/Screens/BuildingNestScreen',
    component: BuildingNestScreen,
} satisfies Meta<typeof BuildingNestScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        userName: 'Aanya',
    },
};

export const CustomStatus: Story = {
    args: {
        userName: 'Kabi',
        statusText: 'Locating the best strategies...',
    },
};
