import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TESTIMONIALS = [
  {
    id: "1",
    name: "Manoj Patel",
    location: "Teacher, Ahmedabad",
    quote: '"Starting with just ₹3,000 a month. Peace of mind.."',
    tag: "Switched from RDs",
    initials: "MP",
  },
  {
    id: "2",
    name: "Rahul & Deepa",
    location: "Business Owners, Indore",
    quote:
      '"We were putting money in FDs \'for the kids\'. Our FD would have covered barely 40% of the actual cost. Nested opened our eyes."',
    tag: "Moved from FD to child fund",
    initials: "RD",
  },
];

export default function TestimonialsSection() {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>What our customers say?</Text>
      <View style={styles.col}>
        {TESTIMONIALS.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.authorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{t.initials}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{t.name}</Text>
                  <Text style={styles.location}>{t.location}</Text>
                </View>
              </View>
              <Text style={styles.stars}>★★★★★</Text>
            </View>
            <Text style={styles.quote}>{t.quote}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{t.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.6,
    paddingRight: 16,
  },
  col: {
    gap: 12,
    paddingRight: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    gap: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6F85F5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  name: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
  },
  location: {
    fontSize: 7,
    fontWeight: "500",
    color: "rgba(0,0,0,0.7)",
  },
  stars: {
    fontSize: 12,
    color: "#F5A623",
    letterSpacing: 2,
  },
  quote: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
    letterSpacing: -0.34,
    lineHeight: 11 * 1.4,
  },
  tag: {
    backgroundColor: "rgba(111,133,245,0.16)",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  tagText: {
    fontSize: 7,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
  },
});
