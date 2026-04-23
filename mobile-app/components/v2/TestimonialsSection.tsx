import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const T = {
  cardBg: "#F2F3FA",
  starColor: "#F5A623",
  tagBg: "#FFFFFF",
  tagText: "#3137D5",
  tagBorder: "#C8CAEE",
  quoteText: "#6B6B80",
  nameText: "#111111",
  locationText: "#8A8A9A",
  avatarBg: "#6F85F5",
} as const;

const TESTIMONIALS = [
  {
    id: "1",
    name: "Rahul & Deepa",
    location: "Business Owners, Indore",
    quote:
      "\u201CWe were putting money in FDs \u2018for the kids\u2019. Our FD would have covered barely 40% of the actual cost. Nested opened our eyes.\u201D",
    tag: "Moved from FD to child fund",
    initials: "RD",
  },
  {
    id: "2",
    name: "Manoj Patel",
    location: "Teacher, Ahmedabad",
    quote: "\u201CStarting with just \u20B93,000 a month. Peace of mind..\u201D",
    tag: "Switched from RDs",
    initials: "MP",
  },
];

export default function TestimonialsSection() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>What our customers say?</Text>
        <TouchableOpacity>
          <Text style={styles.readMore}>Read more ↗</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TESTIMONIALS.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.authorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{t.initials}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.name}>{t.name}</Text>
                <Text style={styles.location}>{t.location}</Text>
              </View>
            </View>
            <Text style={styles.stars}>★★★★★</Text>
            <Text style={styles.quote}>{t.quote}</Text>
            <View style={styles.spacer} />
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t.tag}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    letterSpacing: -0.5,
    flex: 1,
  },
  readMore: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111111",
    textDecorationLine: "underline",
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    backgroundColor: T.cardBg,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    width: 280,
    minHeight: 300,
  },
  spacer: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: T.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  authorInfo: {
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: T.nameText,
  },
  location: {
    fontSize: 12,
    fontWeight: "400",
    color: T.locationText,
  },
  stars: {
    fontSize: 22,
    color: T.starColor,
    letterSpacing: 2,
  },
  quote: {
    fontSize: 15,
    fontWeight: "400",
    color: T.quoteText,
    lineHeight: 22,
  },
  tag: {
    backgroundColor: T.tagBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.tagBorder,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: T.tagText,
  },
});
