import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarDays } from "lucide-react-native";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Button from "./Button";

interface DateInputProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  placeholder?: string;
  error?: string;
  touched?: boolean;
}

function formatDate(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export default function DateInput({
  label,
  value,
  onChange,
  min,
  max,
  placeholder = "DD/MM/YYYY",
  error,
  touched,
}: DateInputProps) {
  const [show, setShow] = useState(false);
  // Temp date for iOS confirmation
  const [tempDate, setTempDate] = useState<Date>(value ?? max ?? new Date());

  const showError = touched && !!error;

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
      if (event.type === "set" && selected) {
        onChange(selected);
      }
    } else {
      // iOS: update temp only; confirm via button
      if (selected) setTempDate(selected);
    }
  };

  const handleConfirmIOS = () => {
    onChange(tempDate);
    setShow(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.trigger, showError && styles.triggerError]}
        onPress={() => {
          setTempDate(value ?? max ?? new Date());
          setShow(true);
        }}
        accessibilityRole="button"
      >
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <CalendarDays size={18} color="#9CA3AF" />
      </Pressable>
      {showError && <Text style={styles.errorText}>{error}</Text>}

      {/* Android: renders inline when show=true */}
      {show && Platform.OS === "android" && (
        <DateTimePicker
          value={value ?? max ?? new Date()}
          mode="date"
          display="default"
          minimumDate={min}
          maximumDate={max}
          onChange={handleChange}
        />
      )}

      {/* iOS: modal with confirm button */}
      {Platform.OS === "ios" && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={() => setShow(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={min}
                maximumDate={max}
                onChange={handleChange}
                style={{ width: "100%" }}
              />
              <View style={styles.modalActions}>
                <Button title="Confirm" onPress={handleConfirmIOS} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  trigger: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  triggerError: {
    borderColor: "#EF4444",
  },
  triggerText: {
    fontSize: 15,
    color: "#1F2937",
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  modalActions: {
    width: "100%",
    marginTop: 16,
  },
});
