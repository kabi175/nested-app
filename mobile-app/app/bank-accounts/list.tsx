import { ThemedText } from "@/components/ThemedText";
import { useBankAccounts, useDeleteBankAccount } from "@/hooks/useBankAccount";
import { BankAccount } from "@/types/bank";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BankAccountsList() {
  const { data: bankAccounts, isLoading } = useBankAccounts();
  const { mutate: deleteBank, isPending } = useDeleteBankAccount();
  const [itemAnimations] = useState(() => new Map<string, Animated.Value>());

  const getAnimation = (itemId: string) => {
    if (!itemAnimations.has(itemId)) {
      itemAnimations.set(itemId, new Animated.Value(0));
    }
    return itemAnimations.get(itemId)!;
  };

  const handleDelete = (account: BankAccount) => {
    Alert.alert(
      "Delete Bank Account",
      `Are you sure you want to delete this ${
        account.type
      } account ending in ${account.accountNumber.slice(-4)}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const animValue = getAnimation(account.id);

            // Animate out first
            Animated.timing(animValue, {
              toValue: -500,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              // Then delete
              deleteBank(account.id, {
                onSuccess: () => {
                  itemAnimations.delete(account.id);
                },
              });
            });
          },
        },
      ]
    );
  };

  const formatAccountNumber = (accountNumber: string) => {
    // Show only last 4 digits
    if (accountNumber.length <= 4) return accountNumber;
    return `****${accountNumber.slice(-4)}`;
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderItem: ListRenderItem<BankAccount> = ({ item }) => {
    const animValue = getAnimation(item.id);
    const animatedStyle = {
      transform: [
        {
          translateX: animValue.interpolate({
            inputRange: [-500, 0],
            outputRange: [-500, 0],
          }),
        },
      ],
      opacity: animValue.interpolate({
        inputRange: [-500, 0],
        outputRange: [0, 1],
      }),
    };

    return (
      <Animated.View style={animatedStyle}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="card" size={24} color="#2563EB" />
            </View>
            <View style={styles.accountInfo}>
              <View style={styles.accountHeader}>
                <ThemedText style={styles.accountType}>
                  {getTypeLabel(item.type)}
                </ThemedText>
                {item.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <ThemedText style={styles.primaryBadgeText}>
                      Primary
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.accountNumber}>
                {formatAccountNumber(item.accountNumber)}
              </ThemedText>
              <ThemedText style={styles.ifscCode}>{item.ifscCode}</ThemedText>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item)}
              disabled={isPending}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bank Accounts</ThemedText>
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => router.push("/bank-accounts")}
        >
          <Ionicons name="add-circle-outline" size={28} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={bankAccounts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color="#9CA3AF" />
            <ThemedText style={styles.emptyTitle}>No Bank Accounts</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Add a bank account to get started
            </ThemedText>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/bank-accounts")}
            >
              <ThemedText style={styles.addButtonText}>
                Add Bank Account
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  addIconButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  accountType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#065F46",
  },
  accountNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  ifscCode: {
    fontSize: 12,
    color: "#6B7280",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
