import { Text } from "@ui-kitten/components";
import React from "react";
import { View } from "react-native";

type StepProgressProps = {
  current: number; // 1-based
  total: number;
  label?: string;
};

export const StepProgress: React.FC<StepProgressProps> = ({
  current,
  total,
  label,
}) => {
  const pct = Math.max(0, Math.min(100, Math.round((current / total) * 100)));
  return (
    <View
      style={{
        width: "100%",
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text category="c1" appearance="hint">
          {label || `Step ${current} of ${total}`}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: "#EDF1F7",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: "#3366FF",
          }}
        />
      </View>
    </View>
  );
};
