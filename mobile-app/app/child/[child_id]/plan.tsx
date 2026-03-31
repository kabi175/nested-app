import BackButton from "@/components/v2/BackButton";
import Button from "@/components/v2/Button";
import ErrorScreen from "@/components/v2/ErrorScreen";
import LoadingScreen from "@/components/v2/LoadingScreen";
import { useChild } from "@/hooks/useChildren";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Building2, Compass, Telescope } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type PlanOption = "field" | "college" | "not_sure";

const OPTIONS: {
  id: PlanOption;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
}[] = [
  {
    id: "field",
    title: "Choose a field",
    subtitle: "Eg. MBBS/ MBA/ IIT etc",
    Icon: Telescope,
  },
  {
    id: "college",
    title: "Have a college in mind",
    subtitle: "IIM/ AIIMS/ DU etc",
    Icon: Building2,
  },
  {
    id: "not_sure",
    title: "Not sure yet",
    subtitle: "Help me explore all possible paths",
    Icon: Compass,
  },
];

export default function PlanScreen() {
  const { child_id } = useLocalSearchParams<{ child_id: string }>();
  const { data: child, isLoading } = useChild(child_id);
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<PlanOption | null>(null);

  if (isLoading) return <LoadingScreen />;
  if (!child) return <ErrorScreen />;

  function handleContinue() {
    if (!selected) return;
    if (selected === "not_sure") {
      router.push({
        pathname: "/child/[child_id]/need-age",
        params: { child_id },
      });
    } else {
      router.push({
        pathname: "/child/[child_id]/child-path-selection",
        params: { child_id },
      });
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#FAFAFA" />

      <View style={styles.content}>
        <BackButton onPress={() => router.back()} />

        <Text style={styles.title}>
          What are you planning for {child.firstName}?
        </Text>
        <Text style={styles.subtitle}>
          Every plan we build is as unique as they are.
        </Text>

        <View style={styles.options}>
          {OPTIONS.map(({ id, title, subtitle, Icon }) => {
            const isSelected = selected === id;
            return (
              <Pressable
                key={id}
                onPress={() => setSelected(id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isSelected && styles.iconCircleSelected,
                  ]}
                >
                  <Icon size={22} color={isSelected ? "#FFFFFF" : "#6B7280"} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{title}</Text>
                  <Text style={styles.cardSubtitle}>{subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        <Button
          title="Continue"
          disabled={!selected}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1D1E20",
    marginTop: 24,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "400",
    color: "#6B7280",
    marginTop: 10,
    lineHeight: 22,
  },
  options: {
    marginTop: 32,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    gap: 16,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#3137D5",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEEEF6",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleSelected: {
    backgroundColor: "#3137D5",
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1E20",
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#6B7280",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#FAFAFA",
  },
});
