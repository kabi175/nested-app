import { FAQAccordion } from "@/components/FAQAccordion";
import { faqData } from "@/utils/faq";
import {
  Layout,
  TopNavigation,
  TopNavigationAction,
} from "@ui-kitten/components";
import { router } from "expo-router";
import { ArrowLeft, Bell } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FAQScreen() {
  const handleBack = () => {
    router.back();
  };

  const BackAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={() => <ArrowLeft strokeWidth={3} />}
      onPress={handleBack}
    />
  );

  const BellAction = (): React.ReactElement => (
    <TopNavigationAction
      icon={() => <Bell size={24} color="#1F2937" />}
      onPress={() => {
        // Handle bell icon press if needed
      }}
    />
  );

  return (
    <Layout style={styles.container} level="1">
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <TopNavigation
          accessoryLeft={BackAction}
          accessoryRight={BellAction}
          title={() => null}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
            <Text style={styles.headerSubtitle}>
              Find answers to common questions about our investment platform.
            </Text>
          </View>

          {/* FAQ Sections */}
          {Object.entries(faqData).map(([sectionTitle, questions]) => (
            <View key={sectionTitle} style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{sectionTitle}</Text>
              {questions.map((faq, index) => (
                <FAQAccordion
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
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
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
});

