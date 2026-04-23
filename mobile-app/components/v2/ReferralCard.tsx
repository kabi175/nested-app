import WhatsAppIcon from "@/assets/images/v2/whatsapp.svg";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Line, Svg } from "react-native-svg";

const REFERRAL_MESSAGE =
  "₹100 a day. That's it. And yet, most of us wait.\n\nWe pour everything into our kids — every meal, every bedtime, every little worry. But their financial future? That's one thing we keep saying we'll start \"someday\".\n\nPlease don't wait. Start for your little one today. 🌱\n\nI'm on Nested — and what makes it special is that every child gets a custom portfolio built around the parent's own dreams for them. Study abroad, MBA, Arts, a safety net — it's tailored, not templated.\n\nhttps://play.google.com/store/apps/details?id=com.nexted.app";

export default function ReferralCard() {
  function handlePress() {
    Linking.openURL("whatsapp://send?text=" + encodeURIComponent(REFERRAL_MESSAGE));
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <BlurView intensity={6} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(18, 231, 255, 0.18)", "rgba(40, 72, 241, 0.18)"]}
        start={{ x: 0, y: 0.45 }}
        end={{ x: 1, y: 0.55 }}
        style={styles.gradient}
      >
        {/* Diagonal stripes — right side only, near WhatsApp icon */}
        <Svg
          style={styles.stripeOverlay}
          width="120"
          height="160"
        >
          {[-30, 20, 70, 120].map((x, i) => (
            <Line
              key={i}
              x1={x}
              y1={0}
              x2={x + 160}
              y2={160}
              stroke="white"
              strokeWidth={26}
              strokeOpacity={0.12}
            />
          ))}
        </Svg>

        {/* EARN ₹500 badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EARN ₹500</Text>
        </View>

        {/* Main content row */}
        <View style={styles.contentRow}>
          <View style={styles.textBlock}>
            <Text style={styles.label}>KNOW A PARENT WHO&apos;D BENEFIT?</Text>
            <Text style={styles.heading}>Refer &amp; Earn</Text>
            <Text style={styles.subtitle}>
              Get <Text style={styles.bold}>₹500</Text> off for each parent you invite.
            </Text>
          </View>

          <View style={styles.rightBlock}>
            <WhatsAppIcon width={58} height={58} />
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  stripeOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 16,
    backgroundColor: "#22C55E",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1A1A2E",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 18,
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
    color: "rgba(0,0,0,0.65)",
  },
  rightBlock: {
    position: "relative",
    width: 72,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  circle1: {
    position: "absolute",
    top: 44,
    left: 28,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "transparent",
  },
  circle2: {
    position: "absolute",
    top: 68,
    left: 38,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "transparent",
  },
  circle3: {
    position: "absolute",
    top: 86,
    left: 46,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
  },
});
