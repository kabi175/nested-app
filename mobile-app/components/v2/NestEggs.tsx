import React from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import Egg from "./Egg";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NestChild {
  id: string;
  color: string;
}

export interface NestEggsProps {
  /** Children to render as eggs (max 3). */
  children: NestChild[];
  /** Id of the currently selected child. */
  selectedChildId: string | null;
  /** Called when an egg is tapped. */
  onSelectChild: (id: string) => void;
}

// ─── Egg layout computation ──────────────────────────────────────────────────
// Returns absolute {top, left} offsets for each egg relative to the nest centre.

const EGG_W = 65;
const EGG_H = 85;

function getEggPositions(
  count: number,
  containerW: number,
  containerH: number
): { top: number; left: number }[] {
  // Centre point of the container (eggs sit slightly above centre to be "in" the nest cup)
  const cx = containerW / 2 - EGG_W / 2;
  const cy = containerH / 2 - EGG_H / 2 - 12; // nudge up into the nest

  if (count === 1) {
    return [{ top: cy, left: cx }];
  }

  if (count === 2) {
    const gap = 28;
    return [
      { top: cy - 2, left: cx - gap },
      { top: cy + 2, left: cx + gap },
    ];
  }

  // count === 3  – triangle: 1 on top, 2 below
  const gap = 30;
  return [
    { top: cy - 16, left: cx },              // top centre
    { top: cy + 10, left: cx - gap },        // bottom left
    { top: cy + 10, left: cx + gap },        // bottom right
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NestEggs({
  children: nestChildren,
  selectedChildId,
  onSelectChild,
}: NestEggsProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerSize = Math.min(screenWidth * 0.7, 300);

  const positions = getEggPositions(nestChildren.length, containerSize, containerSize);

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Eggs — rendered below the nest z-index so the nest rim overlaps them */}
      {nestChildren.map((child, i) => (
        <View
          key={child.id}
          style={[
            styles.eggWrapper,
            { top: positions[i].top, left: positions[i].left },
          ]}
        >
          <Egg
            color={child.color}
            selected={selectedChildId === child.id}
            onPress={() => onSelectChild(child.id)}
            width={EGG_W}
            height={EGG_H}
          />
        </View>
      ))}

      {/* Static nest image on top (rim covers egg bottom) */}
      <Image
        source={require("../../assets/images/v2/nest-animation/nest-frame-4.png")}
        style={styles.nestImage}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  eggWrapper: {
    position: "absolute",
    zIndex: 1,
  },
  nestImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 2,
  },
});
