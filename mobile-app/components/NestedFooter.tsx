import { Layout, Text } from "@ui-kitten/components";
import React from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";

export default function NestedFooter() {
  const handleEmailPress = () => {
    Linking.openURL("mailto:support@nested.money");
  };

  const handlePhonePress = () => {
    Linking.openURL("tel:+916305209273");
  };

  const handleTermsPress = () => {
    Linking.openURL("https://nested.money/terms-and-conditions");
  };

  const handlePrivacyPress = () => {
    Linking.openURL("https://nested.money/privacy-policy");
  };

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Title */}
      <Text style={styles.title}>Nested</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Invest in your child&apos;s dreams, with confidence.
      </Text>

      {/* Contact Information */}
      <View style={styles.contactContainer}>
        <Text style={styles.contactLabel}>Email: </Text>
        <Pressable onPress={handleEmailPress}>
          <Text style={styles.contactLink}>support@nested.money</Text>
        </Pressable>
      </View>

      <View style={styles.contactContainer}>
        <Text style={styles.contactLabel}>Phone/WhatsApp: </Text>
        <Pressable onPress={handlePhonePress}>
          <Text style={styles.contactLink}>+91 63052 09273</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Copyright and Legal Information */}
      <View style={styles.legalContainer}>
        <Text style={styles.copyrightText}>
          © 2025 Nested. GoPlug Enterprises P Ltd.
        </Text>
        <Text style={[styles.copyrightText, { width: "100%" }]}>
          All rights reserved.
        </Text>
        <View style={styles.legalLinksContainer}>
          <Text style={styles.copyrightText}>ARN - 348380. </Text>
          <View style={styles.legalLinksContainer}>
            <Pressable onPress={handleTermsPress}>
              <Text style={styles.legalLink}> Terms & Conditions </Text>
            </Pressable>
            <Text style={styles.bullet}> • </Text>
            <Pressable onPress={handlePrivacyPress}>
              <Text style={styles.legalLink}> Privacy Policy </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#4A4A4A",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  contactLabel: {
    fontSize: 16,
    color: "#4A4A4A",
  },
  contactLink: {
    fontSize: 16,
    color: "#0000FF",
    textDecorationLine: "underline",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 24,
  },
  legalContainer: {
    width: "100%",
    alignItems: "flex-start",
  },
  copyrightText: {
    fontSize: 14,
    color: "#4A4A4A",
    lineHeight: 20,
    marginBottom: 4,
    textAlign: "center",
  },
  legalLinksContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  legalLink: {
    fontSize: 14,
    color: "#0000FF",
    textDecorationLine: "underline",
  },
  bullet: {
    fontSize: 14,
    color: "#4A4A4A",
  },
});
