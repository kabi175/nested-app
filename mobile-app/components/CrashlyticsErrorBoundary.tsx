import { getCrashlytics, log, recordError } from "@react-native-firebase/crashlytics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class CrashlyticsErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      const instance = getCrashlytics();
      recordError(instance, error);
      log(instance, `componentStack: ${info.componentStack}`);
    } catch (e) {
      // Crashlytics native module not available (e.g. dev build without native setup)
      console.error("[CrashlyticsErrorBoundary]", error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>We&apos;ve been notified and are looking into it.</Text>
          <Pressable style={styles.button} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAF9",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2F4BFF",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
