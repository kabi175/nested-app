import { Button, Input, Layout, Spinner, Text } from "@ui-kitten/components";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ImageProps, ScrollView, StyleSheet, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { SafeAreaView } from "react-native-safe-area-context";

const LoadingIndicator = (props: ImageProps) => (
  <View
    style={[props.style, { justifyContent: "center", alignItems: "center" }]}
  >
    <Spinner size="small" />
  </View>
);

export default function TestSign() {
  const { loginWithPasswordRealm } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your username");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      await loginWithPasswordRealm({
        username: username.trim(),
        password: password,
        realm: "phone-and-password",
        scope: "openid profile email phone offline_access",
        audience: `https://${process.env.EXPO_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
      });

      console.log("Login successful");
      router.replace("/account");
    } catch (error: any) {
      console.log("Error", error);
      Alert.alert(
        "Error",
        `Failed to login. Please try again. ${error.message || ""}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Layout style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Layout style={styles.content}>
            <Text category="h4" style={styles.title}>
              Test Sign In
            </Text>
            <Text category="s1" appearance="hint" style={styles.subtitle}>
              Enter your credentials to login
            </Text>

            <Layout style={styles.formContainer}>
              <Text category="s2" style={styles.fieldLabel}>
                Username
              </Text>
              <Input
                style={styles.input}
                placeholder="Enter username or email"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <Text
                category="s2"
                style={[styles.fieldLabel, styles.passwordLabel]}
              >
                Password
              </Text>
              <Input
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Button
                onPress={handleLogin}
                disabled={isLoading || !username.trim() || !password.trim()}
                style={styles.loginButton}
                size="large"
                accessoryLeft={() => (isLoading ? <LoadingIndicator /> : <></>)}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Layout>
          </Layout>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 24,
    marginBottom: 8,
    color: "#1A1A1A",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 32,
    color: "#666666",
  },
  formContainer: {
    backgroundColor: "transparent",
    width: "100%",
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1A1A1A",
  },
  passwordLabel: {
    marginTop: 16,
  },
  input: {
    backgroundColor: "#F8F8F8",
    marginBottom: 4,
  },
  loginButton: {
    width: "100%",
    borderRadius: 12,
    height: 52,
    marginTop: 24,
  },
});
