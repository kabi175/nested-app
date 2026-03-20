import React from "react";
import { Image, useWindowDimensions, View } from "react-native";

export interface NestChild {
  id: string;
  color: string;
}

export interface NestEggsProps {
  children: NestChild[];
  selectedChildId: string | null;
  onSelectChild: (id: string) => void;
}

export default function NestEggs({ children: nestChildren }: NestEggsProps) {
  const { width: screenW } = useWindowDimensions();

  const imgW = Math.min(screenW * 0.85, 320);
  const source =
    nestChildren.length === 1
      ? require("@/assets/images/v2/nest-with-single-egg.png")
      : require("@/assets/images/v2/nest-with-egg.png");

  return (
    <View style={{ alignSelf: "center" }}>
      <Image source={source} style={{ width: imgW }} resizeMode="contain" />
    </View>
  );
}
