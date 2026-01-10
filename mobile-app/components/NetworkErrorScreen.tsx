import { Button, Layout, Text } from "@ui-kitten/components";
import { AxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NetworkErrorScreenProps {
  error: AxiosError | Error;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function NetworkErrorScreen({
  error,
  onRetry,
  onGoBack,
}: NetworkErrorScreenProps) {
  const isNetworkError = (err: AxiosError | Error): boolean => {
    if (err instanceof AxiosError) {
      // Network errors (no response from server)
      if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
        return true;
      }
      // Network unavailable or connection refused
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNREFUSED" ||
        err.message?.toLowerCase().includes("network")
      ) {
        return true;
      }
      // No response indicates network issue
      if (!err.response) {
        return true;
      }
    }
    return false;
  };

  const getErrorMessage = (
    err: AxiosError | Error
  ): {
    title: string;
    subtitle: string;
    icon: "wifi" | "refresh";
  } => {
    if (err instanceof AxiosError) {
      // Timeout errors
      if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
        return {
          title: "Connection Timeout",
          subtitle:
            "The request took too long. Please check your internet connection and try again.",
          icon: "refresh",
        };
      }

      // Network unavailable
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ECONNREFUSED" ||
        !err.response
      ) {
        return {
          title: "No Internet Connection",
          subtitle:
            "Please check your internet connection and try again. Make sure you're connected to Wi‑Fi or mobile data.",
          icon: "wifi",
        };
      }

      // Server errors (5xx)
      if (err.response?.status && err.response.status >= 500) {
        return {
          title: "Server Error",
          subtitle:
            "Our servers are experiencing issues. Please try again in a few moments.",
          icon: "refresh",
        };
      }
    }

    // Generic network error
    return {
      title: "Network Error",
      subtitle:
        "Unable to connect to our servers. Please check your internet connection and try again.",
      icon: "wifi",
    };
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
    // If no onRetry provided, do nothing (should not happen in normal usage)
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      try {
        router.back();
      } catch {
        // If we can't go back, redirect to sign-in
        router.replace("/sign-in");
      }
    }
  };

  const { title, subtitle, icon } = getErrorMessage(error);
  const isOffline = isNetworkError(error) && icon === "wifi";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar style="auto" backgroundColor="#F8FAFC" />
      <Layout style={styles.container} level="1">
        <View style={styles.content}>
          {/* Error Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={
                isOffline ? ["#F59E0B", "#D97706"] : ["#EF4444", "#DC2626"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              {icon === "wifi" ? (
                <WifiOff size={64} color="#FFFFFF" strokeWidth={2.5} />
              ) : (
                <RefreshCw size={64} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </LinearGradient>
          </View>

          {/* Error Message */}
          <View style={styles.textContainer}>
            <Text category="h3" style={styles.title}>
              {title}
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <AlertCircle size={20} color="#F59E0B" />
            <Text category="s2" style={styles.infoText}>
              {isOffline
                ? "Try switching between Wi‑Fi and mobile data, or move to an area with better signal."
                : "If the problem persists, please contact our support team for assistance."}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              style={styles.primaryButton}
              size="large"
              onPress={handleRetry}
              accessoryLeft={() => <RefreshCw size={20} color="#FFFFFF" />}
            >
              Try Again
            </Button>
            {onGoBack !== undefined && (
              <Button
                style={styles.secondaryButton}
                size="large"
                appearance="ghost"
                onPress={handleGoBack}
              >
                Go Back
              </Button>
            )}
          </View>
        </View>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    lineHeight: 24,
    color: "#64748B",
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#FDE68A",
    width: "100%",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: "#92400E",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
});
