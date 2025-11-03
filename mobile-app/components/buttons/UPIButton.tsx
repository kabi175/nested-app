import { Image, Pressable, StyleSheet } from "react-native";

export default function UPIButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={styles.upiImageContainer} onPress={onPress}>
      <Image
        source={require("@/assets/images/UPI.png")}
        style={styles.upiImage}
      />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  upiImageContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    padding: 10,
    height: 80,
    width: 150,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  upiImage: {
    height: "100%",
    width: "100%",
    resizeMode: "contain",
  },
});
