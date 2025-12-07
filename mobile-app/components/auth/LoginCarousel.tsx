import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@ui-kitten/components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = SCREEN_WIDTH; // Match screen width for square aspect ratio
const AUTO_SCROLL_INTERVAL = 3500; // 3.5 seconds

const carouselData = [
  {
    id: 1,
    image: require('@/assets/images/login/1.0.png'),
    title: "Invest in your child's dreams",
    subtitle: 'Start planning for a brighter tomorrow',
  },
  {
    id: 2,
    image: require('@/assets/images/login/2.0.png'),
    title: "Build wealth for tomorrow",
    subtitle: 'Smart investments for your child',
  },
  {
    id: 3,
    image: require('@/assets/images/login/3.0.png'),
    title: "Secure their education",
    subtitle: 'Plan for a successful future',
  },
  {
    id: 4,
    image: require('@/assets/images/login/4.0.png'),
    title: "Start their journey",
    subtitle: 'Invest in what matters most',
  },
  {
    id: 5,
    image: require('@/assets/images/login/5.0.png'),
    title: "Growing together",
    subtitle: 'Your child, your investment',
  },
  {
    id: 6,
    image: require('@/assets/images/login/6.0.png'),
    title: "Financial freedom",
    subtitle: 'Building a better tomorrow',
  },
  {
    id: 7,
    image: require('@/assets/images/login/7.0.png'),
    title: "Dreams come true",
    subtitle: 'Invest in their future today',
  },
];

export default function LoginCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselData.length;
        scrollViewRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {carouselData.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {carouselData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: SCREEN_WIDTH,
    height: CAROUSEL_HEIGHT,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 32,
    right: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    width: 8,
  },
});

