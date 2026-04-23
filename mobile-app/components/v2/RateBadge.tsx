import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export interface RateBadgeProps {
  label?: string;
  /** Width of the banner */
  width?: number;
  /** Height of the banner */
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  /** Darker teal shown through the folded corner */
  foldColor?: string;
  /**
   * How far down the right edge the diagonal fold cut extends.
   * Expressed as a fraction of height (0–1).
   */
  foldRatio?: number;
}

export default function RateBadge({
  label = "UP TO 11% P.A.",
  width = 320,
  height = 70,
  backgroundColor = "#3DDBB8",
  textColor = "#1A2E7A",
  foldColor = "#5A9E92",
  foldRatio = 0.35,
}: RateBadgeProps) {
  const W = width;
  const H = height;

  // The fold cut: diagonal from (W - foldW, 0) on the top edge
  // down to (W, foldH) on the right edge.
  const foldH = H * foldRatio;        // how far down the right edge
  const foldW = foldH * 0.85;        // horizontal extent on the top edge

  // Shadow triangle — rendered first (behind).
  // Sits at the bottom-right corner, exposed by the diagonal cut in the badge.
  //   cut start on bottom edge  →  bottom-right corner  →  cut end on right edge
  const shadow =
    `M ${W - foldW} ${H} ` +
    `L ${W} ${H} ` +
    `L ${W} ${H - foldH} ` +
    `Z`;

  // Main badge — plain rectangle with the bottom-right corner sliced off.
  //   TL → TR → cut start on right edge → cut end on bottom edge → BL → TL
  const badge =
    `M 0 0 ` +
    `L ${W} 0 ` +
    `L ${W} ${H - foldH} ` +
    `L ${W - foldW} ${H} ` +
    `L 0 ${H} ` +
    `Z`;

  return (
    <View style={[styles.wrapper, { width: W, height: H }]}>
      <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
        <Path d={shadow} fill={foldColor} />
        <Path d={badge} fill={backgroundColor} />
      </Svg>

      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
