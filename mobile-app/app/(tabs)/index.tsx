import { LinearGradient } from "expo-linear-gradient";
import { router, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { Baby, Bell, ChartColumnIncreasing, Phone, PiggyBank, ScrollText } from "lucide-react-native";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ChildPlanCard from "@/components/v2/ChildPlanCard";
import CompleteKycComponent from "@/components/v2/CompleteKycComponent";
import OutlineButton from "@/components/v2/OutlineButton";
import { useChild, useChildren } from "@/hooks/useChildren";
import { useDeleteGoal } from "@/hooks/useDeleteGoal";
import { useEducationGoals } from "@/hooks/useGoals";
import { useUser } from "@/hooks/useUser";
import { Goal } from "@/types/investment";
import { formatIndianCompact } from "@/utils/formatters";

function getAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
  ) {
    age--;
  }
  return age;
}

function formatSipDate(date: Date): string {
  const d = new Date(date);
  const month = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  return `${d.getDate()} ${month}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const TESTIMONIALS = [
  {
    id: "1",
    name: "Manoj Patel",
    location: "Teacher, Ahmedabad",
    quote: '"Starting with just ₹3,000 a month. Peace of mind.."',
    tag: "Switched from RDs",
    initials: "MP",
  },
  {
    id: "2",
    name: "Rahul & Deepa",
    location: "Business Owners, Indore",
    quote:
      '"We were putting money in FDs \'for the kids\'. Our FD would have covered barely 40% of the actual cost. Nested opened our eyes."',
    tag: "Moved from FD to child fund",
    initials: "RD",
  },
];

const QUICK_ACTIONS = [
  { label: "Add Money", icon: PiggyBank, route: "/child/select" as const },
  { label: "Edit plan", icon: ChartColumnIncreasing, route: "/child/select" as const },
  { label: "Orders", icon: ScrollText, route: "/orders" as const },
  { label: "Add Child", icon: Baby, route: "/child/create" as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: user } = useUser();
  const { data: children } = useChildren();
  const { data: goals } = useEducationGoals();

  const isKycCompleted = user?.kycStatus === "completed";
  const isInvestedInAnyGoal = goals ? goals.some((g) => g.currentAmount > 0) : false;
  const hasGoals = !!goals && goals.length > 0;
  const showKycCard = !isKycCompleted || !hasGoals;

  const totalCurrentAmount = goals?.reduce((sum, g) => sum + g.currentAmount, 0) ?? 0;
  const totalCorpus = formatIndianCompact(totalCurrentAmount);

  const childName = children?.[0]?.firstName;
  const totalMonthlySip = goals
    ?.map((g) => g.monthlySip)
    .filter((v): v is number => !!v)
    .reduce((a, b) => a + b, 0);
  const monthlyAmount = totalMonthlySip
    ? `₹${formatIndianCompact(totalMonthlySip)}/mo`
    : undefined;

  const userInitial = user?.firstName?.[0]?.toUpperCase() ?? "U";

  function handleContinueKyc() {
    if (isKycCompleted) {
      if (children?.length === 0) {
        router.push("/child/create");
      } else {
        router.push("/child/select");
      }
    } else {
      router.push("/kyc");
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue Header ── */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          {/* Greeting row */}
          <View style={styles.greetingRow}>
            <View style={styles.avatarNameRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userInitial}</Text>
              </View>
              <Text style={styles.greetingText} numberOfLines={1}>
                {getGreeting()}, {user?.firstName ?? ""}
              </Text>
            </View>
            <Bell size={20} color="rgba(255,255,255,0.8)" />
          </View>

          {/* Stats glass card */}
          <View style={styles.statsCard}>
            {/* Corpus section */}
            <View style={styles.corpusSection}>
              <Text style={styles.statsLabel}>TOTAL CORPUS</Text>
              <Text style={styles.corpusAmount}>
                ₹{totalCurrentAmount === 0 ? "0.00" : totalCorpus}
              </Text>
            </View>

            {/* SIP + Growth row */}
            <View style={styles.statsBottomRow}>
              <View style={styles.statItem}>
                <Text style={styles.statsLabel}>MONTHLY SIP</Text>
                <Text style={styles.statValue}>
                  {totalMonthlySip ? `₹${formatIndianCompact(totalMonthlySip)}` : "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
            <TouchableOpacity
              key={label}
              style={styles.quickActionItem}
              onPress={() => router.push(route)}
            >
              <View style={styles.quickActionIcon}>
                <Icon size={24} color="#1A1A1A" strokeWidth={1.5} />
              </View>
              <Text style={styles.quickActionLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── KYC card ── */}
        {showKycCard && (
          <View style={styles.kycCard}>
            <CompleteKycComponent
              childName={childName}
              monthlyAmount={monthlyAmount}
              onPressContinue={handleContinueKyc}
            />
          </View>
        )}

        {/* ── Child plan cards ── */}
        {isKycCompleted && hasGoals && (
          <View style={styles.planCardWrapper}>
            {goals!.map((g) => (
              <GoalPlanCard key={g.id} goal={g} />
            ))}

            {isInvestedInAnyGoal && (
              <OutlineButton
                title="+ Add goal"
                onPress={() => router.push("/child/select")}
              />
            )}
          </View>
        )}

        {/* ── SuperFD Promo Card ── */}
        <View style={styles.superFdCard}>
          <Text style={styles.superFdTag}>Up to 11% p.a.</Text>
          <View style={styles.superFdContent}>
            <View style={styles.superFdTextBlock}>
              <Text style={styles.superFdTitle}>Invest in SuperFD</Text>
              <Text style={styles.superFdDesc}>
                {"Don't be satisfied with bank FD,\nchoose superFD"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.superFdButton}
              onPress={() => router.push("/(tabs)/super-fd")}
            >
              <Text style={styles.superFdButtonText}>Invest now →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── How Nested Helps ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>How Nested helps?</Text>
          <HowNestedHelpsVideo />
        </View>

        {/* ── Testimonials ── */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionTitle}>What our customers say?</Text>
          <View style={styles.testimonialsCol}>
            {TESTIMONIALS.map((t) => (
              <View key={t.id} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAuthorRow}>
                    <View style={styles.testimonialAvatar}>
                      <Text style={styles.testimonialAvatarText}>{t.initials}</Text>
                    </View>
                    <View>
                      <Text style={styles.testimonialName}>{t.name}</Text>
                      <Text style={styles.testimonialLocation}>{t.location}</Text>
                    </View>
                  </View>
                  {/* Star rating */}
                  <Text style={styles.stars}>★★★★★</Text>
                </View>
                <Text style={styles.testimonialQuote}>{t.quote}</Text>
                <View style={styles.testimonialTag}>
                  <Text style={styles.testimonialTagText}>{t.tag}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Referral Card ── */}
        <TouchableOpacity
          style={styles.referralCard}
          onPress={() =>
            Linking.openURL(
              "whatsapp://send?text=" +
              encodeURIComponent(
                "₹100 a day. That's it. And yet, most of us wait.\n\nWe pour everything into our kids — every meal, every bedtime, every little worry. But their financial future? That's one thing we keep saying we'll start \"someday\".\n\nPlease don't wait. Start for your little one today. 🌱\n\nI'm on Nested — and what makes it special is that every child gets a custom portfolio built around the parent's own dreams for them. Study abroad, MBA, Arts, a safety net — it's tailored, not templated.\n\nhttps://play.google.com/store/apps/details?id=com.nexted.app"
              )
            )
          }
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#FFF8E8", "#F0FFF4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralGradient}
          >
            <View style={styles.referralTextBlock}>
              <Text style={styles.referralTitle}>Know a parent who&apos;d benefit?</Text>
              <Text style={styles.referralSubtitle}>
                Share Nested, and get ₹500 off their first month
              </Text>
            </View>
            <View style={styles.whatsappCircle}>
              <Phone size={22} color="#FFFFFF" fill="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const VIDEO_URL =
  "https://res.cloudinary.com/dn6qn2gp8/video/upload/v1773954351/WhatsApp_Video_2026-03-17_at_9.01.57_PM_cf42q1.mp4";

function HowNestedHelpsVideo() {
  const player = useVideoPlayer(VIDEO_URL, (p) => {
    p.loop = true;
    p.muted = false;
  });

  return (
    <VideoView
      player={player}
      style={styles.howVideo}
      contentFit="cover"
      nativeControls
    />
  );
}

const GoalPlanCard = ({ goal }: { goal: Goal }) => {
  const { data: child } = useChild(goal.childId);
  const { mutate: deleteGoal } = useDeleteGoal();

  const isInvestmentMade =
    goal.currentAmount > 0 ||
    (goal.nextSipAmount != null && goal.nextSipAmount > 0);

  const onPressGoalCard = () => {
    if (isInvestmentMade) {
      router.push(`/goal/${goal.id}`);
      return;
    }
    if (goal.education) {
      router.push({
        pathname: "/education/[goal_id]/planner",
        params: { goal_id: goal.id },
      });
      return;
    }
    router.push({
      pathname: "/child/[child_id]/[goal_id]/planner",
      params: { child_id: child?.id, goal_id: goal.id },
    });
  };

  const onDeleteGoal = () => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteGoal({ goalId: goal.id }),
      },
    ]);
  };

  return (
    <ChildPlanCard
      childName={child?.firstName ?? "—"}
      childAge={child ? getAge(child.dateOfBirth) : 0}
      educationId={goal.education?.id}
      collegeType={goal.education?.name}
      goalYear={new Date(goal.targetDate).getFullYear()}
      goalAmount={`₹${formatIndianCompact(goal.targetAmount)}`}
      savedAmount={`₹${formatIndianCompact(goal.currentAmount)}`}
      savedFraction={
        goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0
      }
      nextSipAmount={
        goal.nextSipAmount != null
          ? `₹${formatIndianCompact(goal.nextSipAmount)}`
          : null
      }
      nextSipDate={
        goal.nextSipDate != null ? formatSipDate(goal.nextSipDate) : null
      }
      showDelete={!isInvestmentMade}
      actionLabel={goal.currentAmount === 0 && goal.monthlySip == null ? "Make first payment →" : undefined}
      onPressAction={goal.currentAmount === 0 ? onPressGoalCard : undefined}
      onPressDelete={onDeleteGoal}
      onPress={onPressGoalCard}
    />
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFDF9",
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
  },

  // ── Blue Header ──
  header: {
    backgroundColor: "#2848F1",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  avatarNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F4F4F4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#D42695",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.4,
  },
  greetingText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: -0.54,
    flex: 1,
  },

  // ── Stats Card (glass) ──
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 24,
    gap: 16,
  },
  corpusSection: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 12,
    gap: 4,
  },
  statsLabel: {
    color: "#F4F4F4",
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 0.24,
    textTransform: "uppercase",
  },
  corpusAmount: {
    color: "#F4F4F4",
    fontSize: 36,
    fontWeight: "600",
    letterSpacing: 1.44,
  },
  statsBottomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    gap: 6,
  },
  statValue: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ── Quick Actions ──
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFFDF9",
  },
  quickActionItem: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  quickActionIcon: {
    width: 49,
    height: 49,
    borderRadius: 25,
    backgroundColor: "rgba(244,244,244,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0,0,0,0.8)",
    textAlign: "center",
    letterSpacing: 0.24,
  },

  // ── KYC card ──
  kycCard: {
    marginHorizontal: 16,
    backgroundColor: "#F5F5FA",
    borderRadius: 24,
    overflow: "hidden",
  },

  // ── Plan cards ──
  planCardWrapper: {
    marginHorizontal: 16,
    gap: 12,
  },
  addGoalButton: {
    borderWidth: 1.5,
    borderColor: "#C8C8D8",
    borderStyle: "dashed",
    borderRadius: 16,
    backgroundColor: "#6F85F50F",
    paddingVertical: 18,
    alignItems: "center",
  },
  addGoalText: {
    fontSize: 16,
    color: "#444444",
  },

  // ── SuperFD Card ──
  superFdCard: {
    marginHorizontal: 16,
    backgroundColor: "rgba(255,210,125,0.6)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8,
  },
  superFdTag: {
    color: "#6F85F5",
    fontSize: 12,
    letterSpacing: 0.24,
    textTransform: "uppercase",
  },
  superFdContent: {
    gap: 18,
  },
  superFdTextBlock: {
    gap: 5,
  },
  superFdTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.6,
  },
  superFdDesc: {
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
    letterSpacing: 0.28,
    lineHeight: 14 * 1.6,
  },
  superFdButton: {
    backgroundColor: "#2848F1",
    borderRadius: 8,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "rgba(0,0,0,0.7)",
  },
  superFdButtonText: {
    color: "#FFF7FB",
    fontSize: 18,
    fontWeight: "500",
  },

  // ── How Nested Helps ──
  howVideo: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
  },
  sectionWrapper: {
    gap: 12,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#000000",
    letterSpacing: -0.6,
    paddingRight: 16,
  },
  helpCardsRow: {
    gap: 8,
    paddingRight: 16,
  },
  helpCard: {
    width: 153,
    height: 224,
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
  },
  helpPlayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  helpPlayText: {
    fontSize: 14,
    color: "#2848F1",
  },
  helpCardLabel: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    letterSpacing: 0.24,
  },

  // ── Testimonials ──
  testimonialsCol: {
    gap: 12,
    paddingRight: 16,
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 16,
    gap: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  testimonialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  testimonialAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  testimonialAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6F85F5",
    alignItems: "center",
    justifyContent: "center",
  },
  testimonialAvatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  testimonialName: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
  },
  testimonialLocation: {
    fontSize: 7,
    fontWeight: "500",
    color: "rgba(0,0,0,0.7)",
  },
  stars: {
    fontSize: 12,
    color: "#F5A623",
    letterSpacing: 2,
  },
  testimonialQuote: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
    letterSpacing: -0.34,
    lineHeight: 11 * 1.4,
  },
  testimonialTag: {
    backgroundColor: "rgba(111,133,245,0.16)",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  testimonialTagText: {
    fontSize: 7,
    fontWeight: "500",
    color: "rgba(0,0,0,0.9)",
  },

  // ── Referral Card ──
  referralCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  referralGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  referralTextBlock: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  referralSubtitle: {
    fontSize: 13,
    color: "rgba(0,0,0,0.5)",
    lineHeight: 18,
  },
  whatsappCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
});
