import type { Meta, StoryObj } from "@storybook/react";
import { View } from "react-native";
import StudyAbroadScreen from "../../components/v2/StudyAbroadScreen";

const meta = {
    title: "Screen/StudyAbroadScreen",
    component: StudyAbroadScreen,
    parameters: {
        layout: "fullscreen",
    },
    decorators: [
        (Story) => (
            <View style={{ flex: 1, backgroundColor: "#FAFAF7" }}>
                <Story />
            </View>
        ),
    ],
} satisfies Meta<typeof StudyAbroadScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        onBack: () => console.log("Back pressed"),
        onStartPlanning: () => console.log("Start planning pressed"),
    },
};
