import { useSuperFDBaskets } from "@/hooks/useSuperFDBaskets";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BasketCard from "./BasketCard";

interface SuperFDListProps {
  showHeader?: boolean;
}

export default function SuperFDSection({
  showHeader = true,
}: SuperFDListProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 40; // Account for left padding (20) + right padding (20)
  const cardSpacing = 16;
  const { data: superFDBaskets, isLoading } = useSuperFDBaskets();

  return (
    <View style={styles.container}>
      {showHeader && <SuperFDListHeader />}

      <View style={styles.listContent}>
        {superFDBaskets?.map((item, index) => (
          <View
            key={item.id}
            style={[
              { width: cardWidth },
              {
                marginBottom:
                  index < superFDBaskets.length - 1 ? cardSpacing : 0,
              },
            ]}
          >
            <BasketCard
              data={item}
              cardWidth={cardWidth}
            />
          </View>
        ))}
        {isLoading && (
          <SuperFDListLoading />
        )}
      </View>
    </View>
  );
}

function SuperFDListLoading() {
  return (
    <View style={styles.loadingItem}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

export function SuperFDListHeader() {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>Super FD</Text>
      <Text style={styles.headerSubtitle}>
        Better than bank FD, safer than share market.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
