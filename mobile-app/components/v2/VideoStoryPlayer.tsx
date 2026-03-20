import { VideoView, useVideoPlayer } from 'expo-video';
import { Pause, Play } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  ringR: 28,
  ringSize: 72,
  ringStroke: 2,
  iconSize: 20,
} as const;

const RING_CX = T.ringSize / 2;
const RING_CY = T.ringSize / 2;
const CIRCUMFERENCE = 2 * Math.PI * T.ringR;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

// ── Progress segment ──────────────────────────────────────────────────────────
function Segment({ fill }: { fill: number }) {
  return (
    <View style={seg.track}>
      <View style={[seg.fill, { width: `${Math.min(fill, 1) * 100}%` as `${number}%` }]} />
    </View>
  );
}

const seg = StyleSheet.create({
  track: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface VideoStoryPlayerProps {
  /** List of video URIs to play in sequence. */
  videos?: string[];
  /** Called when the last video finishes. */
  onComplete?: () => void;
  /** Called each time the user taps Skip. */
  onSkip?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VideoStoryPlayer({
  videos = [],
  onComplete,
  onSkip,
}: VideoStoryPlayerProps) {
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Guard so timeUpdate near 100% doesn't fire advanceToNext multiple times.
  const advancedRef = useRef(false);

  const player = useVideoPlayer(videos[0] ?? null, (p) => {
    p.loop = false;
    p.play();
  });

  // ── Advance to next slide ──────────────────────────────────────────────────
  const advanceToNext = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next < videos.length) return next;
      // All slides done
      setTimeout(() => onComplete?.(), 0);
      return prev;
    });
  }, [videos.length, onComplete]);

  // ── Replace source when slide changes ─────────────────────────────────────
  useEffect(() => {
    if (!videos[currentIndex]) return;
    advancedRef.current = false;
    setProgress(0);
    setRemainingTime(0);
    setIsPlaying(true);
    player.replaceAsync(videos[currentIndex]);
    player.play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Detect natural video end and auto-advance ─────────────────────────────
  useEffect(() => {
    const sub = player.addListener('statusChange', ({ status, oldStatus }) => {
      // When a non-looping video finishes it goes readyToPlay → idle
      if (oldStatus === 'readyToPlay' && status === 'idle') {
        advanceToNext();
      }
    });
    return () => sub.remove();
  }, [player, advanceToNext]);

  // ── Track playback time (poll every 100 ms for smooth progress) ───────────
  useEffect(() => {
    const id = setInterval(() => {
      const dur = player.duration;
      const cur = player.currentTime;
      if (!dur) return;
      setProgress(cur / dur);
      setRemainingTime(dur - cur);
    }, 100);
    return () => clearInterval(id);
  }, [player]);

  // ── Sync playing state ─────────────────────────────────────────────────────
  useEffect(() => {
    const sub = player.addListener('playingChange', ({ isPlaying: playing }) => {
      setIsPlaying(playing);
    });
    return () => sub.remove();
  }, [player]);

  // ── Controls ───────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    onSkip?.();
    advanceToNext();
  }, [advanceToNext, onSkip]);

  const togglePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const getBarFill = (i: number) => {
    if (i < currentIndex) return 1;
    if (i === currentIndex) return progress;
    return 0;
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.container}>
      {/* Video background */}
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />

      {/* ── Top overlay ── */}
      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        {/* Progress segments */}
        <View style={styles.progressRow}>
          {videos.map((_, i) => (
            <Segment key={i} fill={getBarFill(i)} />
          ))}
        </View>

        {/* Timer + Skip */}
        <View style={styles.infoRow}>
          <Text style={styles.timer}>{formatTime(remainingTime)}</Text>
          <Pressable style={styles.skipBtn} onPress={handleSkip} hitSlop={8}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Bottom overlay ── */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 16) + 24 }]}>
        <Pressable onPress={togglePlayPause} hitSlop={16}>
          {/* Circular progress ring */}
          <Svg width={T.ringSize} height={T.ringSize}>
            {/* Track */}
            <Circle
              cx={RING_CX}
              cy={RING_CY}
              r={T.ringR}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={T.ringStroke}
              fill="transparent"
            />
            {/* Progress arc */}
            <Circle
              cx={RING_CX}
              cy={RING_CY}
              r={T.ringR}
              stroke="#fff"
              strokeWidth={T.ringStroke}
              fill="transparent"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={`${dashOffset}`}
              strokeLinecap="round"
              rotation={-90}
              originX={RING_CX}
              originY={RING_CY}
            />
          </Svg>

          {/* Pause / Play icon centred over the ring */}
          <View style={styles.iconOverlay}>
            {isPlaying ? (
              <Pause color="#fff" size={T.iconSize} fill="#fff" />
            ) : (
              <Play color="#fff" size={T.iconSize} fill="#fff" />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    gap: 10,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timer: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  skipBtn: {
    borderColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  skipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
