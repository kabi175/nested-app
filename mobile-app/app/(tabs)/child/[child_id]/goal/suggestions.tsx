import { cartAtom } from "@/atoms/cart";
import { FooterActions } from "@/components/goal/suggestions/FooterActions";
import { FundCard } from "@/components/goal/suggestions/FundCard";
import { ScreenHeader } from "@/components/goal/suggestions/ScreenHeader";
import { enrichFunds } from "@/data/mockFunds";
import { useFundAllocations } from "@/hooks/useFundAllocations";
import { useAtomValue } from "jotai";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoalSuggestionsScreen() {
  const cart = useAtomValue(cartAtom);
  const orderIds = cart.map((item) => item.id);

  const { data: funds, isLoading } = useFundAllocations(orderIds);
  const enrichedFunds = funds ? enrichFunds(funds) : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Suggested Investments For Your Goals"
        subtitle="Start today and stay consistent - your goals are within reach."
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : (
          <View style={styles.fundsContainer}>
            {enrichedFunds.map((fund, index) => (
              <FundCard
                key={index}
                fundName={fund.fundName}
                percentage={fund.percentage}
                cagr={fund.cagr}
                expenseRatio={fund.expenseRatio}
                accentColor={fund.accentColor}
                icon={fund.icon}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <FooterActions disabled={isLoading} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fundsContainer: {
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
});
