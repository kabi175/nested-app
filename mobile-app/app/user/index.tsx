import { userAtom } from "@/atoms/user";
import {
  Button,
  Datepicker,
  Input,
  Layout,
  Radio,
  RadioGroup,
  Text,
} from "@ui-kitten/components";
import { StatusBar } from "expo-status-bar";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserScreen() {
  const user = useAtomValue(userAtom);

  const [date, setDate] = useState(new Date());
  const [selectedGender, setSelectedGender] = useState<string>(
    user?.gender || "male"
  );
  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const handleSave = () => {
    console.log("save");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" backgroundColor="#fff" />

      <Layout level="1" style={styles.container}>
        <Text category="h1">User Profile</Text>

        <ScrollView>
          <Input label="First Name" value={user?.firstName} />
          <Input label="Last Name" value={user?.lastName} />

          <Input label="Email" value={user?.email || ""} />
          <Input label="Phone" value={user?.phone_number || ""} />

          <Input label="PAN Number" value={user?.panNumber || ""} />
          <Datepicker
            date={date}
            onSelect={(nextDate) => setDate(nextDate)}
            label="Date of Birth"
          />

          <Text>Gender</Text>
          <RadioGroup
            selectedIndex={genders.findIndex(
              (gender) => gender.value === selectedGender
            )}
            onChange={(index) => setSelectedGender(genders[index].value)}
          >
            {genders.map((gender) => (
              <Radio key={gender.value}>{gender.label}</Radio>
            ))}
          </RadioGroup>

          <Input label="Address" />
          <Input label="City" />
          <Input label="State" />
          <Input label="Zip" />
          <Input label="Country" />

          <Button onPress={() => handleSave()}>Save</Button>
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
});
