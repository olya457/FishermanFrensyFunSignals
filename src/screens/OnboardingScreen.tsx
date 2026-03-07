import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  useWindowDimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const BG = require('../assets/loader_bg.png');
const IMG_1 = require('../assets/onboard_1.png');
const IMG_2 = require('../assets/onboard_2.png');
const IMG_3 = require('../assets/onboard_3.png');
const IMG_4 = require('../assets/onboard_4.png');

const SLIDES = [
  {
    id: 0,
    image: IMG_1,
    title: 'Catch your daily signals',
    text:
      'A fisherman, a fish and a stork are ready to share funny signals with you. Open the app anytime to discover reactions, moods and unexpected answers.',
    button: 'CONTINUE',
  },
  {
    id: 1,
    image: IMG_2,
    title: 'Ask and get a signal',
    text:
      'Ask any question or enter your name. The river will respond with funny answers, nicknames and unexpected reactions.',
    button: 'NEXT',
  },
  {
    id: 2,
    image: IMG_3,
    title: 'Discover stories and uncover facts',
    text:
      'Collect daily worms and use them to uncover funny stories, facts and new signals from the fisherman and his river world.',
    button: 'OK',
  },
  {
    id: 3,
    image: IMG_4,
    title: 'Test your fishing instinct',
    text:
      'Take a short quiz every day with questions about fishing, safety and interesting facts. Answer correctly to get worms.',
    button: 'START',
  },
] as const;

export default function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(24)).current;
  const cardTranslateY = useRef(new Animated.Value(28)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;

  const isSmallScreen = height <= 700;
  const isVerySmallScreen = height <= 640;

  const slide = SLIDES[index];

  useEffect(() => {
    fadeAnim.setValue(0);
    imageTranslateY.setValue(24);
    cardTranslateY.setValue(28);
    cardScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imageTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, fadeAnim, imageTranslateY, cardTranslateY, cardScale]);

  const imageSize = useMemo(() => {
    const maxWidth = Math.min(width - 90, 310);
    const maxHeight = isVerySmallScreen
      ? Math.min(height * 0.34, 270)
      : isSmallScreen
      ? Math.min(height * 0.38, 320)
      : Math.min(height * 0.42, 360);

    return {
      width: maxWidth,
      height: maxHeight,
    };
  }, [width, height, isSmallScreen, isVerySmallScreen]);

  const bottomMargin = Math.max(insets.bottom, 0) + 10;
  const topShiftDown = 20;

  const handleNext = () => {
    if (index === SLIDES.length - 1) {
      navigation.replace('Mood');
      return;
    }
    setIndex(prev => prev + 1);
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.root}>
          <Animated.View
            style={[
              styles.topArea,
              {
                paddingTop: (isVerySmallScreen ? 6 : 12) + topShiftDown,
                opacity: fadeAnim,
                transform: [{ translateY: imageTranslateY }],
              },
            ]}
          >
            <Image
              source={slide.image}
              style={[styles.heroImage, imageSize]}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomWrap,
              {
                marginBottom: bottomMargin + 40,
                opacity: fadeAnim,
                transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
              },
            ]}
          >
            <View
              style={[
                styles.bottomCard,
                isSmallScreen && styles.bottomCardSmall,
                isVerySmallScreen && styles.bottomCardVerySmall,
              ]}
            >
              <Text
                style={[
                  styles.title,
                  isSmallScreen && styles.titleSmall,
                  isVerySmallScreen && styles.titleVerySmall,
                ]}
              >
                {slide.title}
              </Text>

              <Text
                style={[
                  styles.text,
                  isSmallScreen && styles.textSmall,
                  isVerySmallScreen && styles.textVerySmall,
                ]}
              >
                {slide.text}
              </Text>

              <Pressable
                style={[
                  styles.button,
                  isSmallScreen && styles.buttonSmall,
                  isVerySmallScreen && styles.buttonVerySmall,
                ]}
                onPress={handleNext}
              >
                <Text
                  style={[
                    styles.buttonText,
                    isVerySmallScreen && styles.buttonTextVerySmall,
                  ]}
                >
                  {slide.button}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  safe: {
    flex: 1,
  },

  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  topArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  heroImage: {
    maxWidth: '100%',
  },

  bottomWrap: {
    width: '100%',
    alignItems: 'center',
  },

  bottomCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#E7C168',
    borderWidth: 2,
    borderColor: '#2A1B0E',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  bottomCardSmall: {
    maxWidth: 324,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },

  bottomCardVerySmall: {
    maxWidth: 310,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },

  title: {
    color: '#16110B',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  titleSmall: {
    fontSize: 17,
    lineHeight: 21,
  },

  titleVerySmall: {
    fontSize: 16,
    lineHeight: 20,
  },

  text: {
    marginTop: 12,
    color: '#2A1B0E',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    textAlign: 'center',
    minHeight: 84,
  },

  textSmall: {
    marginTop: 10,
    fontSize: 11.5,
    lineHeight: 16,
    minHeight: 74,
  },

  textVerySmall: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 15,
    minHeight: 64,
  },

  button: {
    marginTop: 16,
    width: 134,
    height: 46,
    backgroundColor: '#26D221',
    borderWidth: 2,
    borderColor: '#165F12',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonSmall: {
    marginTop: 14,
    width: 128,
    height: 44,
  },

  buttonVerySmall: {
    marginTop: 12,
    width: 122,
    height: 42,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  buttonTextVerySmall: {
    fontSize: 13,
  },
});