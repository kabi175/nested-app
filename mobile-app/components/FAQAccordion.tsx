import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FAQAccordionProps {
  question: string;
  answer: string;
}

export function FAQAccordion({ question, answer }: FAQAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, rotateAnim, heightAnim]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && contentHeight !== height) {
      setContentHeight(height);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const animatedHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight || 0],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.questionContainer}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.questionText,
            isExpanded && styles.questionTextExpanded,
          ]}
        >
          {question}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={20} color={isExpanded ? "#2563EB" : "#6B7280"} />
        </Animated.View>
      </TouchableOpacity>

      {/* Hidden view to measure content height */}
      <View
        style={styles.measurementView}
        onLayout={handleContentLayout}
        collapsable={false}
      >
        <View style={styles.answerCard}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.answerContainer,
          {
            height: animatedHeight,
          },
        ]}
      >
        <View style={styles.answerContent} pointerEvents="none">
          <View style={styles.answerCard}>
            <Text style={styles.answerText}>{answer}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  questionContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    marginRight: 12,
    lineHeight: 22,
  },
  questionTextExpanded: {
    color: "#2563EB",
    fontWeight: "600",
  },
  measurementView: {
    position: "absolute",
    opacity: 0,
    zIndex: -1,
  },
  answerContainer: {
    overflow: "hidden",
    marginTop: 8,
  },
  answerContent: {
    paddingHorizontal: 0,
  },
  answerCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
  },
  answerText: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 22,
  },
});
