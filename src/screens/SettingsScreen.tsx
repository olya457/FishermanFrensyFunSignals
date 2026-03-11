import React, { useEffect, useRef, useState } from 'react';
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
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const BG = require('../assets/loader_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');

const STORAGE_NOTIFICATIONS = 'river_notifications_enabled';

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 690;
  const isTiny = height < 640;

  const contentWidth = Math.min(width - (isTiny ? 20 : 34), isTiny ? 306 : isVerySmall ? 320 : 340);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_NOTIFICATIONS);
        if (raw === null) {
          setNotificationsEnabled(true);
          return;
        }
        setNotificationsEnabled(raw === '1');
      } catch (error) {}
    };

    loadSettings();
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(24);
    scaleAnim.setValue(0.98);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 520,
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
  }, [fadeAnim, translateAnim, scaleAnim]);

  const handleToggleNotifications = async () => {
    try {
      const nextValue = !notificationsEnabled;
      setNotificationsEnabled(nextValue);
      await AsyncStorage.setItem(STORAGE_NOTIFICATIONS, nextValue ? '1' : '0');
    } catch (error) {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `Fishing: Fun Fun Signals is a relaxing and humorous app where you can interact with the world of fishermen, fish and rivers. ` +
          `Discover funny signals, create nicknames, read stories and exchange worms for fishing facts and tips. ` +
          `The app is designed to bring light, fun and curiosity to your day through simple and enjoyable interactions. ` +
          `Everything runs locally on your device with no accounts or data collection.`,
      });
    } catch (error) {}
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          <Animated.View
            style={[
              styles.header,
              {
                width: contentWidth,
                marginTop: insets.top + 6,
                opacity: fadeAnim,
                transform: [{ translateY: translateAnim }],
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={() => navigation.replace('Menu')}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={[styles.headerTitle, isTiny && styles.headerTitleTiny]}>
              SETTINGS
            </Text>
          </Animated.View>

          <ScrollView
            style={styles.flexFull}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom, 16) + 14,
              },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                styles.mainCard,
                {
                  width: contentWidth,
                  marginTop: isTiny ? 14 : isVerySmall ? 18 : 24,
                  opacity: fadeAnim,
                  transform: [{ translateY: translateAnim }, { scale: scaleAnim }],
                  paddingHorizontal: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleRow,
                  {
                    minHeight: isTiny ? 78 : isVerySmall ? 86 : 94,
                    paddingHorizontal: isTiny ? 10 : 14,
                    paddingVertical: isTiny ? 10 : 12,
                  },
                ]}
              >
                <Text style={[styles.toggleLabel, isTiny && styles.toggleLabelTiny]}>
                  NOTIFICATIONS
                </Text>

                <Pressable
                  style={[
                    styles.toggleButton,
                    notificationsEnabled ? styles.toggleOn : styles.toggleOff,
                    {
                      width: isTiny ? 96 : isVerySmall ? 112 : 126,
                      height: isTiny ? 46 : isVerySmall ? 50 : 56,
                    },
                  ]}
                  onPress={handleToggleNotifications}
                >
                  <Text style={[styles.toggleButtonText, isTiny && styles.toggleButtonTextTiny]}>
                    {notificationsEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.aboutCard,
                  {
                    marginTop: isTiny ? 10 : 12,
                    paddingHorizontal: isTiny ? 10 : 14,
                    paddingTop: isTiny ? 12 : 14,
                    paddingBottom: isTiny ? 14 : 16,
                  },
                ]}
              >
                <Text style={[styles.aboutTitle, isTiny && styles.aboutTitleTiny]}>
                  ABOUT THE APP
                </Text>

                <Text style={[styles.aboutText, isTiny && styles.aboutTextTiny]}>
                  Is a humorous app where you can
                  interact with the world of fishermen, fish and rivers. Discover funny signals,
                  create nicknames, read stories and exchange worms for fishing facts and tips. The
                  app is designed to bring light, fun and curiosity to your day through simple and
                  enjoyable interactions. Everything runs locally on your device with no accounts or
                  data collection.
                </Text>

                <Pressable
                  style={[
                    styles.shareButton,
                    {
                      width: '100%',
                      height: isTiny ? 50 : isVerySmall ? 56 : 62,
                      marginTop: isTiny ? 14 : 18,
                    },
                  ]}
                  onPress={handleShare}
                >
                  <Text style={[styles.shareButtonText, isTiny && styles.shareButtonTextTiny]}>
                    SHARE
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
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

  flexFull: {
    width: '100%',
  },

  scrollContent: {
    width: '100%',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 38,
    height: 38,
    backgroundColor: '#27E51E',
    borderWidth: 2,
    borderColor: '#11680D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  backIcon: {
    width: 18,
    height: 18,
  },

  headerTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
  },

  headerTitleTiny: {
    fontSize: 16,
  },

  mainCard: {
    backgroundColor: 'transparent',
  },

  toggleRow: {
    width: '100%',
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toggleLabel: {
    flex: 1,
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
    paddingRight: 10,
  },

  toggleLabelTiny: {
    fontSize: 14,
    paddingRight: 8,
  },

  toggleButton: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleOn: {
    backgroundColor: '#18E61B',
    borderColor: '#11680D',
  },

  toggleOff: {
    backgroundColor: '#F01818',
    borderColor: '#7F0B0B',
  },

  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  toggleButtonTextTiny: {
    fontSize: 13,
  },

  aboutCard: {
    width: '100%',
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
  },

  aboutTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },

  aboutTitleTiny: {
    fontSize: 14,
  },

  aboutText: {
    marginTop: 10,
    color: '#111111',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },

  aboutTextTiny: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
  },

  shareButton: {
    alignSelf: 'stretch',
    backgroundColor: '#D78917',
    borderWidth: 2,
    borderColor: '#7A4300',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  shareButtonTextTiny: {
    fontSize: 14,
  },
});