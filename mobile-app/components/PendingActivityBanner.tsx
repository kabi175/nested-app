import { getPendingOrdersByGoalId } from "@/api/paymentAPI";
import { cartAtom } from "@/atoms/cart";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePendingActivities } from "@/hooks/usePendingActivities";
import { Goal } from "@/types";
import { useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { Banknote, IdCard, Landmark, UserCog } from "lucide-react-native";
import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PendingActivityBannerProps = {
  onPress?: (event: GestureResponderEvent) => void;
};

export function PendingActivityBanner({ onPress }: PendingActivityBannerProps) {
  const colorScheme = useColorScheme();
  const { data: activities, isLoading } = usePendingActivities();
  const router = useRouter();
  const setCart = useSetAtom(cartAtom);

  if (isLoading || !activities || activities.length === 0) {
    return null;
  }

  const [firstActivity] = activities;

  const renderIcon = () => {
    const iconColor = "#FFFFFF";
    const size = 18;

    switch (firstActivity.type) {
      case "kyc_incomplete":
        return <IdCard size={size} color={iconColor} />;
      case "bank_account_pending":
        return <Banknote size={size} color={iconColor} />;
      case "goal_payment_pending":
        return <Landmark size={size} color={iconColor} />;
      case "profile_incomplete":
      default:
        return <UserCog size={size} color={iconColor} />;
    }
  };

  const handlePress = async (event: GestureResponderEvent) => {
    if (onPress) {
      onPress(event);
      return;
    }

    switch (firstActivity.type) {
      case "kyc_incomplete":
        router.push("/kyc");
        break;
      case "bank_account_pending":
        router.push("/bank-accounts");
        break;
      case "goal_payment_pending":
        const goal = firstActivity.metadata as Goal;
        const orders = await getPendingOrdersByGoalId(goal.id);
        if (orders.length > 0) {
          setCart(orders);
        }
        router.push("/payment");
        break;
      case "nominee_configuration_pending":
        router.push("/nominees");
        break;
      case "profile_incomplete":
      default:
        router.push("/account");
        break;
    }
  };

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <Pressable
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
        onPress={handlePress}
      >
        <View style={styles.leftSection}>
          <View style={styles.avatar}>{renderIcon()}</View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {firstActivity.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {firstActivity.description}
            </Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.ctaText}>Proceed</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "#F97316",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  rightSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
