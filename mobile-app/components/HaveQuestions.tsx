import { openWhatsApp } from "@/utils/whtsapp";
import { Layout, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { HelpCircle, MessageCircle } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function HaveQuestions() {
  const handleFAQPress = () => {
    router.push("/faq");
  };

  const handleWhatsAppPress = () => {
    openWhatsApp("916305209273", "Hello 👋");
  };

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={styles.card}>
        {/* FAQ Row */}
        <Pressable
          onPress={handleFAQPress}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.iconContainer}>
            <HelpCircle size={24} color="#9CA3AF" strokeWidth={2} />
          </View>
          <Text category="s1" style={styles.faqText}>
            Have questions? Read FAQs
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider} />

        {/* WhatsApp Row */}
        <Pressable
          onPress={handleWhatsAppPress}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.iconContainer}>
            <MessageCircle size={24} color="#9CA3AF" strokeWidth={2} />
          </View>
          <Text category="p1" style={styles.whatsappText}>
            Need support? WhatsApp us.
          </Text>
        </Pressable>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 12,
  },
  faqText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    flex: 1,
  },
  whatsappText: {
    fontSize: 16,
    color: "#000000",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
    marginHorizontal: 36,
  },
});
