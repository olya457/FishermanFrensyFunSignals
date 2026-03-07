import React, { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const BG = require('../assets/loader_bg.png');
const TOP_ICON = require('../assets/menu_top_icon.png');
const WORM_ICON = require('../assets/worm_icon.png');
const TOOLBOX_ICON = require('../assets/toolbox_icon.png');

const STORAGE_TOTAL_WORMS = 'river_total_worms';
const STORAGE_SELECTED_MOOD = 'river_selected_mood';

export default function MenuScreen({ navigation }: Props) {
  const [worms, setWorms] = useState(0);
  const [mood, setMood] = useState('Funny');

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const topAnim = useRef(new Animated.Value(20)).current;
  const buttonsAnim = useRef(new Animated.Value(28)).current;
  const settingsAnim = useRef(new Animated.Value(36)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 690;
  const isTiny = height < 640;

  const contentWidth = Math.min(width - 56, isTiny ? 300 : 320);
  const topImageSize = isTiny ? 102 : isVerySmall ? 110 : isSmall ? 114 : 118;
  const boxHeight = isTiny ? 46 : isVerySmall ? 48 : 50;
  const fullButtonHeight = isTiny ? 54 : isVerySmall ? 56 : 60;
  const halfButtonHeight = isTiny ? 54 : isVerySmall ? 56 : 60;
  const topGap = isTiny ? 12 : 16;
  const buttonGap = isTiny ? 10 : 14;
  const settingsIconSize = isTiny ? 26 : isVerySmall ? 28 : 30;

  const loadData = useCallback(async () => {
    try {
      const values = await AsyncStorage.multiGet([
        STORAGE_TOTAL_WORMS,
        STORAGE_SELECTED_MOOD,
      ]);

      const totalWormsRaw = values[0][1];
      const selectedMood = values[1][1] || 'Funny';

      const totalWorms = totalWormsRaw ? Number(totalWormsRaw) : 0;

      setWorms(Number.isFinite(totalWorms) ? totalWorms : 0);
      setMood(selectedMood);
    } catch (error) {
      setWorms(0);
      setMood('Funny');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    fadeAnim.setValue(0);
    topAnim.setValue(20);
    buttonsAnim.setValue(28);
    settingsAnim.setValue(36);
    scaleAnim.setValue(0.97);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(topAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonsAnim, {
        toValue: 0,
        duration: 620,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(settingsAnim, {
        toValue: 0,
        duration: 700,
        delay: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, topAnim, buttonsAnim, settingsAnim, scaleAnim]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          <View
            style={[
              styles.mainPanel,
              {
                width: contentWidth,
                paddingTop: insets.top + (isTiny ? 6 : 12),
                paddingBottom: Math.max(insets.bottom, 14) + (isTiny ? 8 : 14),
              },
            ]}
          >
            <Animated.View
              style={{
                width: '100%',
                opacity: fadeAnim,
                transform: [{ translateY: topAnim }, { scale: scaleAnim }],
              }}
            >
              <View style={[styles.topRow, { marginBottom: buttonGap }]}>
                <Image
                  source={TOP_ICON}
                  style={{ width: topImageSize, height: topImageSize }}
                  resizeMode="cover"
                />

                <View style={[styles.infoColumn, { marginLeft: topGap }]}>
                  <View style={[styles.wormBox, { minHeight: boxHeight }]}>
                    <View style={styles.wormRow}>
                      <Image
                        source={WORM_ICON}
                        style={[styles.wormIcon, isTiny && styles.wormIconTiny]}
                        resizeMode="contain"
                      />
                      <Text style={[styles.wormValue, isTiny && styles.wormValueTiny]}>
                        {worms}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.moodBox,
                      {
                        minHeight: boxHeight,
                        marginTop: isTiny ? 10 : 14,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.moodValue, isTiny && styles.moodValueTiny]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {mood}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={{
                width: '100%',
                opacity: fadeAnim,
                transform: [{ translateY: buttonsAnim }],
              }}
            >
              <Pressable
                style={[styles.fullButton, { height: fullButtonHeight, marginTop: 0 }]}
                onPress={() => navigation.navigate('AskRiver')}
              >
                <Text style={[styles.fullButtonText, isTiny && styles.fullButtonTextTiny]}>
                  Ask River
                </Text>
              </Pressable>

              <Pressable
                style={[styles.fullButton, { height: fullButtonHeight, marginTop: buttonGap }]}
                onPress={() => navigation.navigate('Nickname')}
              >
                <Text style={[styles.fullButtonText, isTiny && styles.fullButtonTextTiny]}>
                  Nickname
                </Text>
              </Pressable>

              <View style={[styles.doubleRow, { marginTop: buttonGap }]}>
                <Pressable
                  style={[styles.halfButton, { height: halfButtonHeight }]}
                  onPress={() => navigation.navigate('Stories')}
                >
                  <Text style={[styles.halfButtonText, isTiny && styles.halfButtonTextTiny]}>
                    Stories
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.halfButton, { height: halfButtonHeight }]}
                  onPress={() => navigation.navigate('DailyQuiz')}
                >
                  <Text style={[styles.quizButtonText, isTiny && styles.quizButtonTextTiny]}>
                    DAILY{'\n'}QUIZ
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.fullButton, { height: fullButtonHeight, marginTop: buttonGap }]}
                onPress={() => navigation.navigate('WormJar')}
              >
                <Text style={[styles.fullButtonText, isTiny && styles.fullButtonTextTiny]}>
                  Worm Jar
                </Text>
              </Pressable>
            </Animated.View>

            <Animated.View
              style={{
                width: '100%',
                opacity: fadeAnim,
                transform: [{ translateY: settingsAnim }],
                marginTop: buttonGap,
              }}
            >
              <Pressable
                style={[styles.settingsButton, { height: fullButtonHeight }]}
                onPress={() => navigation.navigate('Settings')}
              >
                <Image
                  source={TOOLBOX_ICON}
                  style={{ width: settingsIconSize, height: settingsIconSize }}
                  resizeMode="contain"
                />
                <Text style={[styles.settingsButtonText, isTiny && styles.settingsButtonTextTiny]}>
                  Settings
                </Text>
              </Pressable>
            </Animated.View>
          </View>
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
  },

  mainPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },

  wormBox: {
    backgroundColor: '#F4C861',
    borderWidth: 2,
    borderColor: '#9A5B00',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  wormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  wormIcon: {
    width: 28,
    height: 28,
    marginRight: 8,
  },

  wormIconTiny: {
    width: 24,
    height: 24,
    marginRight: 6,
  },

  wormValue: {
    color: '#000000',
    fontSize: 21,
    fontWeight: '900',
  },

  wormValueTiny: {
    fontSize: 18,
  },

  moodBox: {
    backgroundColor: '#F4C861',
    borderWidth: 2,
    borderColor: '#9A5B00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  moodValue: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '900',
  },

  moodValueTiny: {
    fontSize: 15,
  },

  fullButton: {
    width: '100%',
    backgroundColor: '#20E51A',
    borderWidth: 2,
    borderColor: '#0E5F0C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  fullButtonTextTiny: {
    fontSize: 14,
  },

  doubleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  halfButton: {
    width: '47%',
    backgroundColor: '#20E51A',
    borderWidth: 2,
    borderColor: '#0E5F0C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  halfButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  halfButtonTextTiny: {
    fontSize: 13,
  },

  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  quizButtonTextTiny: {
    fontSize: 11,
    lineHeight: 14,
  },

  settingsButton: {
    width: '100%',
    backgroundColor: '#D78917',
    borderWidth: 2,
    borderColor: '#7A4300',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  settingsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 10,
  },

  settingsButtonTextTiny: {
    fontSize: 14,
    marginLeft: 8,
  },
});