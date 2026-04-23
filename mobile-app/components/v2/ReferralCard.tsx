import { LinearGradient } from "expo-linear-gradient";
import { Phone } from "lucide-react-native";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const REFERRAL_MESSAGE =
  "₹100 a day. That's it. And yet, most of us wait.\n\nWe pour everything into our kids — every meal, every bedtime, every little worry. But their financial future? That's one thing we keep saying we'll start \"someday\".\n\nPlease don't wait. Start for your little one today. 🌱\n\nI'm on Nested — and what makes it special is that every child gets a custom portfolio built around the parent's own dreams for them. Study abroad, MBA, Arts, a safety net — it's tailored, not templated.\n\nhttps://play.google.com/store/apps/details?id=com.nexted.app";

export default function ReferralCard() {
  function handlePress() {
    Linking.openURL("whatsapp://send?text=" + encodeURIComponent(REFERRAL_MESSAGE));
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <LinearGradient
        colors={["#FFF8E8", "#F0FFF4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.textBlock}>
          <Text style={styles.title}>Know a parent who&apos;d benefit?</Text>
          <Text style={styles.subtitle}>
            Share Nested, and get ₹500 off their first month
          </Text>
        </View>
        <View style={styles.whatsappCircle}>
          <Phone size={22} color="#FFFFFF" fill="#FFFFFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 18,
  },
  whatsappCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
});
