import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Linking,
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

  const renderAnswer = (text: string) => {
    // Supports simple markdown-style links: [label](https://example.com)
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    // eslint-disable-next-line no-cond-assign
    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const [fullMatch, label, url] = match;

      if (matchIndex > lastIndex) {
        nodes.push(
          <Text key={`t-${key++}`} style={styles.answerText}>
            {text.slice(lastIndex, matchIndex)}
          </Text>
        );
      }

      nodes.push(
        <Text
          key={`l-${key++}`}
          style={[styles.answerText, styles.linkText]}
          onPress={() => Linking.openURL(url)}
          suppressHighlighting
        >
          {label}
        </Text>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      nodes.push(
        <Text key={`t-${key++}`} style={styles.answerText}>
          {text.slice(lastIndex)}
        </Text>
      );
    }

    // If no links were found, render the original string as-is.
    if (nodes.length === 0) {
      return <Text style={styles.answerText}>{text}</Text>;
    }

    // Render inline segments within a single parent <Text> to preserve wrapping.
    return <Text style={styles.answerText}>{nodes}</Text>;
  };

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
        pointerEvents="none"
      >
        <View style={styles.answerCard}>
          {renderAnswer(answer)}
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
        <View style={styles.answerContent}>
          <View style={styles.answerCard}>
            {renderAnswer(answer)}
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
  linkText: {
    color: "#2563EB",
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
