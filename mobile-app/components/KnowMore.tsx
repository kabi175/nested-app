import { Layout, Text } from "@ui-kitten/components";
import {
  Award,
  Clock,
  Heart,
  Shield,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";

interface MainFeatureCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  backgroundColor: string;
  iconBgColor: string;
  iconColor: string;
}

interface SmallFeatureCard {
  title: string;
  icon: React.ReactNode;
  backgroundColor: string;
  iconColor: string;
}

const mainFeatures: MainFeatureCard[] = [
  {
    title: "No Lock-In",
    subtitle: "Withdraw anytime without penalties",
    icon: <Clock size={20} />,
    backgroundColor: "#DBF2FF",
    iconBgColor: "#DBF2FF",
    iconColor: "#2563EB",
  },
  {
    title: "Flexible SIP",
    subtitle: "Adjust or pause SIP's anytime",
    icon: <Heart size={20} />,
    backgroundColor: "#FCE7F3",
    iconBgColor: "#FCE7F3",
    iconColor: "#EC4899",
  },
  {
    title: "Money goes directly to AMCs",
    subtitle: "Your investment is always safe",
    icon: <TrendingUp size={20} />,
    backgroundColor: "#D1FAE5",
    iconBgColor: "#D1FAE5",
    iconColor: "#10B981",
  },
];

const smallFeatures: SmallFeatureCard[] = [
  {
    title: "Goal-linked portfolio",
    icon: <UsersRound size={24} />,
    backgroundColor: "#F3E8FF",
    iconColor: "#8B5CF6",
  },
  {
    title: "Tailored for education goals",
    icon: <Zap size={24} />,
    backgroundColor: "#FFF4E6",
    iconColor: "#F59E0B",
  },
  {
    title: "Disciplined yet flexible",
    icon: <Award size={24} />,
    backgroundColor: "#E0E7FF",
    iconColor: "#6366F1",
  },
];

export default function KnowMore() {
  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header */}
      <Layout style={[styles.header, { backgroundColor: "transparent" }]}>
        <Text category="h4" style={styles.title}>
          Know More
        </Text>
        <Text category="p1" style={styles.subtitle}>
          Why investors trust Nested
        </Text>
      </Layout>

      {/* Main Feature Cards */}
      <Layout
        style={[styles.mainCardsContainer, { backgroundColor: "transparent" }]}
      >
        {mainFeatures.map((feature, index) => (
          <Layout
            key={index}
            style={[
              styles.mainCard,
              { backgroundColor: feature.backgroundColor },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: feature.iconBgColor },
              ]}
            >
              {React.cloneElement(feature.icon as React.ReactElement<any>, {
                color: feature.iconColor,
              })}
            </View>
            <Layout
              style={[
                styles.mainCardContent,
                { backgroundColor: "transparent" },
              ]}
            >
              <Text category="h6" style={styles.mainCardTitle}>
                {feature.title}
              </Text>
              <Text category="p2" style={styles.mainCardSubtitle}>
                {feature.subtitle}
              </Text>
            </Layout>
          </Layout>
        ))}
      </Layout>

      {/* Small Feature Cards */}
      <Layout
        style={[styles.smallCardsContainer, { backgroundColor: "transparent" }]}
      >
        {smallFeatures.map((feature, index) => (
          <Layout
            key={index}
            style={[
              styles.smallCard,
              { backgroundColor: feature.backgroundColor },
            ]}
          >
            <View style={styles.smallCardIcon}>
              {React.cloneElement(feature.icon as React.ReactElement<any>, {
                color: feature.iconColor,
              })}
            </View>
            <Text category="s1" style={styles.smallCardTitle}>
              {feature.title}
            </Text>
          </Layout>
        ))}
      </Layout>

      {/* Security Bar */}
      <Layout style={[styles.securityBar, { backgroundColor: "#F3F4F6" }]}>
        <View style={styles.securityBarContent}>
          <Shield size={20} color="#1F2937" />
          <Text category="p2" style={styles.securityBarText}>
            100% Secure · SEBI Registered
          </Text>
        </View>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingVertical: 8,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#1F2937",
  },
  mainCardsContainer: {
    gap: 16,
  },
  mainCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  mainCardContent: {
    flex: 1,
    gap: 4,
  },
  mainCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  smallCardsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  smallCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    minHeight: 100,
    justifyContent: "center",
  },
  smallCardIcon: {
    marginBottom: 4,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  securityBar: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  securityBarContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  securityBarText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
});
