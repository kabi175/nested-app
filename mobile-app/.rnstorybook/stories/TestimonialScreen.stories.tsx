import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import TestimonialScreen from "../../components/v2/TestimonialScreen";

const meta = {
    title: "Screen/TestimonialScreen",
    component: TestimonialScreen,
    parameters: {
        layout: "fullscreen",
    },
    args: {
        childName: "Aanya",
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1, backgroundColor: "#fff" }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof TestimonialScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        childName: "Aanya",
        onStartFund: () => console.log("Start fund clicked"),
        onBack: () => console.log("Back clicked"),
        onReadMore: () => console.log("Read more clicked"),
    },
};
