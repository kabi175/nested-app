import { userAtom } from "@/atoms/user";
import { useAuth } from "@/hooks/auth";
import { useUser } from "@/hooks/useUser";
import { Redirect } from "expo-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Home() {
  const { isSignedIn, isLoaded, user: authUser } = useAuth();
  const { data: user, isLoading } = useUser();
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  if (!isLoaded || isLoading) {
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

  if (authUser?.displayName === null) {
    return <Redirect href="/name-input" />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/sign-in" />;
}

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
