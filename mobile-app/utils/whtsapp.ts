import { Alert, Linking } from "react-native";

export const openWhatsApp = (
  phoneNumber: string,
  message: string = "Hello 👋"
) => {
  const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
    message
  )}`;
  Linking.canOpenURL(url)
    .then((supported) => {
      if (!supported) {
        Alert.alert("Error", "WhatsApp is not installed on your device");
      } else {
        return Linking.openURL(url);
      }
    })
    .catch((err) => console.error("Error opening WhatsApp:", err));
};
