import GraduationCap from "@/assets/images/v2/planner/graduation-cap.svg";
import Nest from "@/assets/images/v2/nest.svg";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

const BASE_WIDTH = 390;

export default function MadeWithLoveSection() {
  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / BASE_WIDTH, 0.85), 1.15);

  const taglineSize = Math.round(15 * scale);
  const headlineSize = Math.round(22 * scale);
  const illustrationW = Math.round(100 * scale);
  const illustrationH = Math.round(72 * scale);
  const nestW = Math.round(92 * scale);
  const nestH = Math.round(54 * scale);
  const capSize = Math.round(30 * scale);

  return (
    <View style={styles.wrapper}>
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.tagline,
            { fontSize: taglineSize, lineHeight: Math.round(taglineSize * 1.4) },
          ]}
        >
          Smart education fund{"\n"}that grows with your child
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.headline,
            { fontSize: headlineSize, lineHeight: Math.round(headlineSize * 1.25) },
          ]}
        >
          Made with <Text style={styles.heart}>♥</Text> in India
        </Text>
      </View>

      <View
        style={[
          styles.illustration,
          { width: illustrationW, height: illustrationH, opacity: 0.55 },
        ]}
      >
        <View style={styles.nestWrap}>
          <Nest width={nestW} height={nestH} />
        </View>
        <View
          style={[
            styles.cap,
            { right: Math.round(6 * scale), top: Math.round(2 * scale) },
          ]}
        >
          <GraduationCap width={capSize} height={capSize} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  textBlock: {
    flex: 1,
    marginRight: 8,
  },
  tagline: {
    fontWeight: "400",
    color: "#8A8A9A",
  },
  headline: {
    fontWeight: "300",
    color: "#B8B8C2",
    marginTop: 16,
    letterSpacing: -0.3,
  },
  heart: {
    color: "#F7B6C0",
  },
  illustration: {
    position: "relative",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  nestWrap: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  cap: {
    position: "absolute",
  },
});
