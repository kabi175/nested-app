import { Alert, Linking } from "react-native";

export const openWhatsApp = async (
  phoneNumber: string,
  message: string = "Hello 👋"
) => {
  // Remove any non-numeric characters except + at the start
  let cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

  // Remove leading + if present (WhatsApp URL doesn't need it)
  if (cleanNumber.startsWith("+")) {
    cleanNumber = cleanNumber.substring(1);
  }

  // Encode the message
  const encodedMessage = encodeURIComponent(message);

  // Try different URL schemes
  const whatsappUrl = `whatsapp://send?phone=${cleanNumber}&text=${encodedMessage}`;
  const webUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  // Try opening WhatsApp directly with native URL scheme
  // This is more reliable than checking canOpenURL first
  try {
    await Linking.openURL(whatsappUrl);
  } catch {
    // If native scheme fails, try web URL as fallback
    // The web URL will open WhatsApp if installed, or browser if not
    try {
      await Linking.openURL(webUrl);
    } catch {
      Alert.alert(
        "Error",
        "Unable to open WhatsApp. Please make sure WhatsApp is installed on your device."
      );
    }
  }
};
