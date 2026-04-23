import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const VIDEO_URL =
  "https://res.cloudinary.com/dn6qn2gp8/video/upload/v1773954351/WhatsApp_Video_2026-03-17_at_9.01.57_PM_cf42q1.mp4";

export default function HowNestedHelpsSection() {
  const player = useVideoPlayer(VIDEO_URL, (p) => {
    p.loop = true;
    p.muted = false;
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>How Nested helps?</Text>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    paddingLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.6,
    paddingRight: 16,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
  },
});
