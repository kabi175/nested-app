import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Database, House, LucideIcon, UserRound } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const ACTIVE_COLOR = "#2848F1";
const INACTIVE_COLOR = "#9CA3AF";
const SPRING = { damping: 16, stiffness: 220, mass: 0.7 };

const ROUTE_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: "Home", icon: House },
  "super-fd": { label: "SuperFD", icon: Database },
  account: { label: "Profile", icon: UserRound },
};

function TabItem({
  routeName,
  focused,
  onPress,
  accessibilityLabel,
}: {
  routeName: string;
  focused: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const config = ROUTE_CONFIG[routeName];
  if (!config) return null;

  const Icon = config.icon;
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, SPRING);
  }, [focused]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.4 + 0.6 * progress.value }],
  }));

  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
    >
      {/* top indicator line */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      <Icon
        size={22}
        color={color}
        strokeWidth={focused ? 2.5 : 1.75}
      />
      <Text style={[styles.label, { color }, focused && styles.labelActive]}>
        {config.label}
      </Text>
    </Pressable>
  );
}

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;

        function onPress() {
          if (Platform.OS === "ios") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            focused={focused}
            onPress={onPress}
            accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 0,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 6,
    gap: 4,
  },
  indicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "400",
  },
  labelActive: {
    fontWeight: "600",
  },
});
