import { userAtom } from "@/atoms/user";
import { useAuth } from "@/hooks/auth";
import { useUser } from "@/hooks/useUser";
import { Redirect } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Home() {
  const { isSignedIn, isLoaded, user } = useAuth();

  if (!isLoaded) {
    // show logo
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/icon.png")} // 👈 put your logo image here
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (user?.displayName === null) {
    return <Redirect href="/name-input" />;
  }

  if (isSignedIn) {
    return <Authorized />;
  }

  return <Redirect href="/sign-in" />;
}

const Authorized = () => {
  const { data: user, isLoading } = useUser();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  if (!isLoading) {
    return null;
  }

  return <Redirect href="/(tabs)" />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // ✅ white background
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    color: "#333", // dark gray text
    fontSize: 20,
    fontWeight: "600",
  },
});
