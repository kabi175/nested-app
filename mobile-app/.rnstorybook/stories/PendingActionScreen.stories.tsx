import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import PendingActionScreen from "../../components/v2/PendingActionScreen";

const meta = {
    title: "Screen/PendingActionScreen",
    component: PendingActionScreen,
    parameters: {
        layout: "fullscreen",
    },
    args: {
        currentMonthIndex: new Date().getMonth(),
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof PendingActionScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onCompleteKYC: () => console.log("Complete KYC clicked"),
        onDoLater: () => console.log("Do Later clicked"),
    },
};

export const NextMonthDemo: Story = {
    args: {
        currentMonthIndex: (new Date().getMonth() + 1) % 12,
        onCompleteKYC: () => console.log("Complete KYC clicked"),
        onDoLater: () => console.log("Do Later clicked"),
    },
};
