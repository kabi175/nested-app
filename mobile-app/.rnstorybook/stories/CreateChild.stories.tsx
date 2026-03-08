import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CreateChild from "../../app/(tabs)/child/create";

// Mock Query Client for the useCreateChild hook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const meta = {
  title: "Screens/CreateChild",
  component: CreateChild,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1, height: "100%" }}>
          <Story />
        </View>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof CreateChild>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
