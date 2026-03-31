import { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export function LinkMethodCard({
  icon: Icon,
  title,
  description,
  selected,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Icon size={22} color={selected ? "#2848F1" : "#000000"} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, selected && styles.titleSelected]}>
          {title}
        </Text>
        <Text style={[styles.description, selected && styles.descriptionSelected]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
    height: 92,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  cardSelected: {
    backgroundColor: "#2848F1",
    borderColor: "#2848F1",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  iconContainerSelected: {
    backgroundColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "InstrumentSans_500Medium",
    color: "#000000",
    marginBottom: 4,
  },
  titleSelected: {
    color: "#FFFFFF",
  },
  description: {
    fontSize: 12,
    fontFamily: "InstrumentSans_400Regular",
    color: "rgba(0,0,0,0.6)",
    lineHeight: 16,
  },
  descriptionSelected: {
    color: "rgba(255,255,255,0.8)",
  },
});
