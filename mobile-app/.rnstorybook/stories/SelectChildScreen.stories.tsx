import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import SelectChildScreen from "../../components/v2/SelectChildScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta = {
  title: "v2/SelectChildScreen",
  component: SelectChildScreen,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Story />
        </View>
      </QueryClientProvider>
    ),
  ],
  argTypes: {
    onAddChild: { action: "addChild" },
    onContinue: { action: "continue" },
  },
} satisfies Meta<typeof SelectChildScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default — fetches children from API via useChildren(). */
export const Default: Story = {
  args: {},
};

/** With callbacks wired to Storybook actions panel. */
export const WithActions: Story = {
  args: {
    onAddChild: undefined,
    onContinue: undefined,
  },
};
