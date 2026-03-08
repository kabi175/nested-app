import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "./Button";
import CollegeDropdown from "./CollegeDropdown";
import PathCard from "./PathCard";

// ─── SVG illustrations ────────────────────────────────────────────────────────
import ArtsIcon from "@/assets/images/v2/education-plan/art-design.svg";
import IitsIcon from "@/assets/images/v2/education-plan/iit-nit.svg";
import MbaIcon from "@/assets/images/v2/education-plan/mba.svg";
import MedicalIcon from "@/assets/images/v2/education-plan/medical.svg";
import StudyAbroadIcon from "@/assets/images/v2/education-plan/study-abroad.svg";
import TopCollegesIcon from "@/assets/images/v2/education-plan/top-colleges.svg";

// ─── Path data ────────────────────────────────────────────────────────────────
const ICON_SIZE = 120;

const PATHS = [
  {
    id: "top-colleges",
    title: "Top colleges India",
    icon: <TopCollegesIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "study-abroad",
    title: "Study Abroad",
    icon: <StudyAbroadIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "medical",
    title: "Medical/MBBS",
    icon: <MedicalIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "mba",
    title: "MBA/IIM",
    icon: <MbaIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -18 }} />,
  },
  {
    id: "arts",
    title: "Arts & Design",
    icon: <ArtsIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -15 }} />,
  },
  {
    id: "iits",
    title: "IITs/NITs",
    icon: <IitsIcon width={ICON_SIZE} height={ICON_SIZE} style={{ bottom: -30 }} />,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ChildPathSelectionScreenProps {
  childName: string;
  onStartPlanning?: (pathId: string | null, college: string | null) => void;
  onNotSure?: () => void;
  onBack?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChildPathSelectionScreen({
  childName,
  onStartPlanning,
  onNotSure,
  onBack,
}: ChildPathSelectionScreenProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);

  const canContinue = selectedPath !== null || selectedCollege !== null;

  const handlePathPress = (pathId: string) => {
    setSelectedPath((prev) => (prev === pathId ? null : pathId));
    // Clear college when a path is selected
    setSelectedCollege(null);
  };

  const handleCollegeSelect = (college: string | null) => {
    setSelectedCollege(college);
    // Clear path when a college is selected
    setSelectedPath(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.root}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <View style={styles.header}>
            <Pressable
              onPress={onBack}
              style={styles.backButton}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={22} color="#1A1A1A" />
            </Pressable>

            <View style={styles.titleContainer} >
              <Text style={styles.title}>
                What path do you see for
              </Text>
              <Text style={styles.title}>
                {childName}?
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Every plan we build is as unique as they are.
            </Text>
          </View>

          {/* ── Path grid (2 columns) ──────────────────────────── */}
          <View style={styles.grid}>
            {PATHS.map((path, index) => {
              const isLeft = index % 2 === 0;
              return (
                <View
                  key={path.id}
                  style={[
                    styles.gridItem,
                    isLeft ? styles.gridItemLeft : styles.gridItemRight,
                  ]}
                >
                  <PathCard
                    title={path.title}
                    icon={path.icon}
                    selected={selectedPath === path.id}
                    onPress={() => handlePathPress(path.id)}
                  />
                </View>
              );
            })}
          </View>

          {/* ── OR divider ─────────────────────────────────────── */}
          <Text style={styles.orText}>OR</Text>

          {/* ── College dropdown ────────────────────────────────── */}
          <View style={styles.collegeSection}>
            <Text style={styles.collegeLabel}>Have a college in mind?</Text>
            <CollegeDropdown
              selectedCollege={selectedCollege}
              onSelectCollege={handleCollegeSelect}
            />
          </View>
          {/* ── Bottom buttons ───────────────────────────── */}
          <View style={styles.buttonsContainer}>
            <Button
              title={`Start planning for ${childName}`}
              disabled={!canContinue}
              onPress={() =>
                onStartPlanning?.(selectedPath, selectedCollege)
              }
            />

            {/* Not sure yet — outlined */}
            <Pressable
              onPress={onNotSure}
              style={styles.notSureButton}
              accessibilityRole="button"
            >
              <Text style={styles.notSureLabel}>Not sure yet</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    width: "100%",
    fontSize: 14,
    color: "#7A7A7A",
    lineHeight: 20,
    textAlign: "center",
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridItem: {
    width: "50%",
    paddingVertical: 6,
  },
  gridItemLeft: {
    paddingLeft: 6,
    paddingRight: 6,
  },
  gridItemRight: {
    paddingLeft: 6,
    paddingRight: 6,
  },

  // OR divider
  orText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginVertical: 24,
  },

  // College section
  collegeSection: {
    marginBottom: 16,
  },
  collegeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },

  // Buttons
  buttonsContainer: {
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
  },
  notSureButton: {
    width: "100%",
    height: 55,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  notSureLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
