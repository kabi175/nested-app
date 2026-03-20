import type { Meta, StoryObj } from "@storybook/react-native";
import { View } from "react-native";

// Since SignIn uses expo-router and react-native-auth0, we need to mock them for Storybook.
// In a real Storybook setup, these would be handled globally or in preview.tsx, 
// but for the sake of rendering the component isolated here we can mock the hooks inline if needed,
// or rely on Storybook decorators if the environment provides them.
// We'll proceed with the assumption the environment handles basic mocks, or we just render the raw view.
import SignIn from "../../app/sign-in";

const meta = {
  title: "app/SignIn",
  component: SignIn,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SignIn>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
