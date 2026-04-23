import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

import RateBadge from "../../components/v2/RateBadge";

const meta = {
  title: "v2/RateBadge",
  component: RateBadge,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#9E9E9E",
        }}
      >
        <Story />
      </View>
    ),
  ],
  args: {
    label: "UP TO 11% P.A.",
    width: 320,
    height: 70,
    backgroundColor: "#3DDBB8",
    textColor: "#1A2E7A",
    foldColor: "#5A9E92",
    foldRatio: 0.35,
  },
  argTypes: {
    label: { control: "text" },
    backgroundColor: { control: "color" },
    textColor: { control: "color" },
    foldColor: { control: "color" },
    width: { control: { type: "range", min: 160, max: 400, step: 8 } },
    height: { control: { type: "range", min: 40, max: 120, step: 4 } },
    foldRatio: { control: { type: "range", min: 0.1, max: 0.6, step: 0.05 } },
  },
} satisfies Meta<typeof RateBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { width: 220, height: 50, foldRatio: 0.3 },
};

export const CustomLabel: Story = {
  args: { label: "EARN 9% P.A." },
};

export const OnDarkCard: Story = {
  decorators: [
    (Story) => (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1E2AAA",
        }}
      >
        <Story />
      </View>
    ),
  ],
};
