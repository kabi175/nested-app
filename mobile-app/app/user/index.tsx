import { updateUser } from "@/api/userApi";
import { userAtom } from "@/atoms/user";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Datepicker,
  Input,
  Radio,
  RadioGroup,
  Text,
} from "@ui-kitten/components";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { CalendarDays } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    panNumber: user?.panNumber || "",
    dob: user?.dob || new Date(),
    gender: user?.gender || "male",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const [isEditing, setIsEditing] = useState(true);

  // Sync form data when user changes
  useEffect(() => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      panNumber: user?.panNumber || "",
      dob: user?.dob || new Date(),
      gender: user?.gender || "male",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
  }, [user]);

  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User ID not found");
      }
      return await updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone_number: formData.phone_number,
        panNumber: formData.panNumber,
        dob: formData.dob,
        gender: formData.gender as "male" | "female" | "other",
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.user] });
      setIsEditing(true);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
      console.error("Error updating user:", error);
      console.log(error.message);
    },
  });

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateUserMutation.mutate();
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="auto" backgroundColor="#F9FAFB" />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#2563EB" />
              </TouchableOpacity>
              <ThemedText type="title">Edit Profile</ThemedText>
              <ThemedText style={styles.subtitle}>
                Update your personal information
              </ThemedText>
            </View>

            {/* Personal Information */}
            <Card style={styles.card} disabled>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={20} color="#2563EB" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.formSection}>
                <Input
                  value={formData.firstName}
                  label="First Name"
                  placeholder="Enter your first name"
                  onChangeText={(value) =>
                    handleFieldChange("firstName", value)
                  }
                  disabled={!isEditing}
                  style={styles.input}
                  size="large"
                />

                <Input
                  value={formData.lastName}
                  label="Last Name"
                  placeholder="Enter your last name"
                  onChangeText={(value) => handleFieldChange("lastName", value)}
                  disabled={!isEditing}
                  style={styles.input}
                  size="large"
                />

                <Datepicker
                  label="Date of Birth"
                  placeholder="Pick Date"
                  date={formData.dob}
                  min={new Date("1920-01-01")}
                  max={new Date()}
                  onSelect={(nextDate) => handleFieldChange("dob", nextDate)}
                  accessoryRight={() => <CalendarDays size={20} />}
                  disabled={!isEditing}
                  style={styles.input}
                  size="large"
                />

                <View style={styles.genderContainer}>
                  <Text style={styles.genderLabel}>Gender</Text>
                  <RadioGroup
                    selectedIndex={genders.findIndex(
                      (gender) => gender.value === formData.gender
                    )}
                    onChange={(index) =>
                      handleFieldChange("gender", genders[index].value)
                    }
                  >
                    {genders.map((gender) => (
                      <Radio key={gender.value}>{gender.label}</Radio>
                    ))}
                  </RadioGroup>
                </View>
              </View>
            </Card>

            {/* Contact Information */}
            <Card style={styles.card} disabled>
              <View style={styles.sectionHeader}>
                <Ionicons name="call-outline" size={20} color="#10B981" />
                <Text style={styles.sectionTitle}>Contact Information</Text>
              </View>
              <View style={styles.formSection}>
                <Input
                  value={formData.email}
                  label="Email"
                  placeholder="Enter your email"
                  onChangeText={(value) => handleFieldChange("email", value)}
                  disabled={!isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  size="large"
                />

                <Input
                  value={formData.phone_number}
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  onChangeText={(value) =>
                    handleFieldChange("phone_number", value)
                  }
                  disabled={!isEditing}
                  keyboardType="phone-pad"
                  style={styles.input}
                  size="large"
                />
              </View>
            </Card>

            {/* Financial Information */}
            <Card style={styles.card} disabled>
              <View style={styles.sectionHeader}>
                <Ionicons name="card-outline" size={20} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Financial Information</Text>
              </View>
              <View style={styles.formSection}>
                <Input
                  value={formData.panNumber}
                  label="PAN Number"
                  placeholder="Enter your PAN number"
                  onChangeText={(value) =>
                    handleFieldChange("panNumber", value)
                  }
                  disabled={!isEditing}
                  autoCapitalize="characters"
                  style={styles.input}
                  size="large"
                />
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {!isEditing ? (
                <Button
                  style={styles.primaryButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsEditing(true);
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <View style={styles.editActions}>
                  <Button
                    style={styles.cancelButton}
                    appearance="ghost"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsEditing(false);
                      // Reset form data to original values
                      setFormData({
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        email: user?.email || "",
                        phone_number: user?.phone_number || "",
                        panNumber: user?.panNumber || "",
                        dob: user?.dob || new Date(),
                        gender: user?.gender || "male",
                        address: "",
                        city: "",
                        state: "",
                        zip: "",
                        country: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={styles.primaryButton}
                    onPress={handleSave}
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                </View>
              )}
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 24,
    top: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  avatarCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  formSection: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 8,
  },
  genderLabel: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  bottomSpacing: {
    height: 20,
  },
});
