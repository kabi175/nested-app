import { Layout, Text } from "@ui-kitten/components";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Share2 } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, Share, StyleSheet, View } from "react-native";

export default function ShareApp() {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Check out Nested - the best way to secure your child's future education!",
        title: "Nested - Secure Your Child's Future",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log("Shared with activity type:", result.activityType);
        } else {
          // Shared
          console.log("Shared successfully");
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log("Share dismissed");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to share the app");
      console.error("Error sharing:", error);
    }
  };

  const handleStartJourney = () => {
    router.push("/(tabs)/child/create");
  };

  return (
    <Layout style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Central Share Card */}
      <View style={styles.shareCard}>
        {/* Share Icon */}
        <View style={styles.shareIconContainer}>
          <Share2 size={32} color="#FFFFFF" strokeWidth={2.5} />
        </View>

        {/* Main Heading */}
        <Text category="h4" style={styles.mainHeading}>
          Help another child&apos;s dream take flight.
        </Text>

        {/* Sub-text */}
        <Text category="p1" style={styles.subText}>
          Share this app with fellow parents.
        </Text>

        {/* Share Now Button */}
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.shareButton,
            pressed && styles.shareButtonPressed,
          ]}
        >
          <LinearGradient
            colors={["#ADD8E6", "#6BA3D5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareButtonGradient}
          >
            <Text style={styles.shareButtonText}>Share Now</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Bottom Journey Button */}
      <Pressable
        onPress={handleStartJourney}
        style={({ pressed }) => [
          styles.journeyButton,
          pressed && styles.journeyButtonPressed,
        ]}
      >
        <LinearGradient
          colors={["#4A90E2", "#6A5ACD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.journeyButtonGradient}
        >
          <Text style={styles.journeyButtonText}>Start Your Journey Today</Text>
        </LinearGradient>
      </Pressable>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 24,
  },
  shareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  shareIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#B0E0E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#B0E0E6",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 32,
  },
  subText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  shareButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#ADD8E6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonPressed: {
    opacity: 0.9,
  },
  shareButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  journeyButton: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#4A90E2",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  journeyButtonPressed: {
    opacity: 0.9,
  },
  journeyButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
