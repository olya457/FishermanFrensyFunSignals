import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Share,
  useWindowDimensions,
  Alert,
  Image,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Nickname'>;
type ScreenStep = 'form' | 'result';

const BG = require('../assets/loader_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');
const CONTINUE_ICON = require('../assets/worm_icon.png');

const NICKNAMES = [
  'Fishing line',
  'Silent float',
  'Deep cast',
  'Silver hook',
  'River trace',
  'Old wobbler',
  'Dark current',
  'Slow crucian carp',
  'Golden catch',
  'Morning bite',
  'Calm water',
  'Wild cast',
  'Stone bank',
  'River shadow',
  'Silent catfish',
  'Northern float',
  'Deep splash',
  'Silver wave',
  'Old fisherman',
  'Fast wobbler',
  'Hidden hook',
  'River ghost',
  'Dark crucian carp',
  'Golden worm',
  'River hunter',
  'Deep trace',
  'Sleeping water',
  'Distant cast',
  'Silver fin',
  'Quiet bank',
  'Stone hook',
  'Evening bite',
  'River observer',
  'Wild float',
  'Old trace',
  'Deep hunter',
  'Morning wave',
  'Silver crucian carp',
  'Silent hunter',
  'Dark float',
  'Lonely hook',
  'River stalker',
  'Sleepy crucian carp',
  'Golden fin',
  'Shadow float',
  'Deep worm',
  'Old bank',
  'Silent cast',
  'River catcher',
  'Last bite',
] as const;

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function NicknameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [resultNickname, setResultNickname] = useState('');
  const [step, setStep] = useState<ScreenStep>('form');

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 680;
  const isTiny = height < 630;

  const panelWidth = useMemo(
    () => Math.min(width - 32, isTiny ? 312 : 340),
    [width, isTiny],
  );

  const keySize = isTiny ? 24 : isVerySmall ? 26 : 28;
  const keyFont = isTiny ? 10 : 12;
  const actionButtonWidth = isTiny ? 168 : 182;
  const actionButtonHeight = isTiny ? 50 : isVerySmall ? 52 : 54;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(22);
    scaleAnim.setValue(0.98);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
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
  }, [step, fadeAnim, slideAnim, scaleAnim]);

  const appendKey = (key: string) => {
    if (name.length >= 18) {
      return;
    }
    setName(prev => prev + key);
  };

  const addSpace = () => {
    if (!name.length || name.endsWith(' ') || name.length >= 18) {
      return;
    }
    setName(prev => prev + ' ');
  };

  const removeLast = () => {
    setName(prev => prev.slice(0, -1));
  };

  const clearCurrent = () => {
    setName('');
  };

  const generateNickname = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Empty name', 'Please enter your name.');
      return;
    }

    const index = trimmedName
      .split('')
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % NICKNAMES.length;

    setResultNickname(NICKNAMES[index]);
    setStep('result');
  };

  const handleNewNickname = () => {
    setName('');
    setResultNickname('');
    setStep('form');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `River Nickname\nName: ${name.trim()}\nNickname: ${resultNickname}`,
      });
    } catch (error) {}
  };

  const handleBack = () => {
    navigation.replace('Menu');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          <Animated.View
            style={[
              styles.header,
              {
                width: panelWidth,
                marginTop: insets.top + 6,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={[styles.headerTitle, isVerySmall && styles.headerTitleSmall]}>
              NICKNAME
            </Text>
          </Animated.View>

          {step === 'form' && (
            <ScrollView
              style={{ width: '100%' }}
              contentContainerStyle={styles.formScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    width: panelWidth,
                    marginTop: isTiny ? 18 : isVerySmall ? 22 : 28,
                    paddingVertical: isTiny ? 14 : 18,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                  },
                ]}
              >
                <Text style={[styles.formTitle, isVerySmall && styles.formTitleSmall]}>
                  Enter your name and{'\n'}receive your river{'\n'}identity.
                </Text>

                <View style={[styles.inputBox, isTiny && styles.inputBoxTiny]}>
                  <Text
                    style={[
                      styles.inputValue,
                      isTiny && styles.inputValueTiny,
                      !name && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {name || 'Name'}
                  </Text>
                </View>

                <View style={styles.keyboardWrap}>
                  <Text style={styles.keyboardTitle}>NAME KEYBOARD</Text>

                  {KEY_ROWS.map((row, rowIndex) => (
                    <View key={`row-${rowIndex}`} style={styles.keyRow}>
                      {row.map(key => (
                        <Pressable
                          key={key}
                          style={[
                            styles.keyButton,
                            {
                              width: keySize,
                              height: keySize + 2,
                              marginHorizontal: isTiny ? 1 : 1.5,
                            },
                          ]}
                          onPress={() => appendKey(key)}
                        >
                          <Text style={[styles.keyText, { fontSize: keyFont }]}>{key}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}

                  <View style={[styles.bottomKeyRow, isTiny && styles.bottomKeyRowTiny]}>
                    <Pressable style={[styles.longKey, styles.spaceKey]} onPress={addSpace}>
                      <Text style={[styles.longKeyText, isTiny && styles.longKeyTextTiny]}>
                        SPACE
                      </Text>
                    </Pressable>

                    <Pressable style={[styles.shortKey, styles.clearKey]} onPress={clearCurrent}>
                      <Text style={[styles.longKeyText, isTiny && styles.longKeyTextTiny]}>
                        CLEAR
                      </Text>
                    </Pressable>

                    <Pressable style={[styles.shortKey, styles.deleteKey]} onPress={removeLast}>
                      <Text style={[styles.longKeyText, isTiny && styles.longKeyTextTiny]}>
                        ⌫
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.continueButton,
                    { width: actionButtonWidth, height: actionButtonHeight },
                  ]}
                  onPress={generateNickname}
                >
                  <Image source={CONTINUE_ICON} style={styles.continueIcon} resizeMode="contain" />
                  <Text style={styles.actionButtonText}>CONTINUE</Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
          )}

          {step === 'result' && (
            <Animated.View
              style={[
                styles.resultWrap,
                {
                  width: panelWidth,
                  marginTop: isVerySmall ? 26 : 34,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <Text style={[styles.resultHeader, isVerySmall && styles.resultHeaderSmall]}>
                RESULT
              </Text>

              <View style={styles.resultCard}>
                <View style={styles.resultNameBox}>
                  <Text
                    style={[styles.resultNameText, isVerySmall && styles.resultNameTextSmall]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {resultNickname}
                  </Text>
                </View>

                <Text style={[styles.resultSubText, isVerySmall && styles.resultSubTextSmall]}>
                  identity.
                </Text>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.continueButton,
                    {
                      width: actionButtonWidth,
                      height: actionButtonHeight,
                      marginTop: 16,
                    },
                  ]}
                  onPress={handleNewNickname}
                >
                  <Text style={styles.actionButtonText}>NEW NICKNAME</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.actionButton,
                    styles.shareButton,
                    {
                      width: actionButtonWidth,
                      height: actionButtonHeight,
                      marginTop: 12,
                    },
                  ]}
                  onPress={handleShare}
                >
                  <Text style={styles.actionButtonText}>SHARE</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },

  safe: {
    flex: 1,
  },

  root: {
    flex: 1,
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

  headerTitleSmall: {
    fontSize: 16,
  },

  formScroll: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 24,
  },

  formCard: {
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  formTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },

  formTitleSmall: {
    fontSize: 16,
    lineHeight: 21,
    marginBottom: 14,
  },

  inputBox: {
    width: '100%',
    minHeight: 50,
    borderWidth: 2,
    borderColor: '#8C4B00',
    backgroundColor: '#F0C869',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },

  inputBoxTiny: {
    minHeight: 46,
    marginBottom: 8,
  },

  inputValue: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
  },

  inputValueTiny: {
    fontSize: 13,
  },

  placeholderText: {
    color: '#B88831',
  },

  keyboardWrap: {
    width: '100%',
    marginTop: 4,
    marginBottom: 12,
  },

  keyboardTitle: {
    color: '#5A3500',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  keyRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginBottom: 6,
  },

  keyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#8C4B00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  keyText: {
    color: '#111111',
    fontWeight: '900',
  },

  bottomKeyRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  bottomKeyRowTiny: {
    marginTop: 2,
  },

  longKey: {
    height: 34,
    backgroundColor: '#27E51E',
    borderWidth: 2,
    borderColor: '#11680D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shortKey: {
    height: 34,
    backgroundColor: '#D78917',
    borderWidth: 2,
    borderColor: '#7A4300',
    alignItems: 'center',
    justifyContent: 'center',
  },

  spaceKey: {
    width: '46%',
  },

  clearKey: {
    width: '24%',
  },

  deleteKey: {
    width: '24%',
  },

  longKeyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  longKeyTextTiny: {
    fontSize: 10,
  },

  actionButton: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  continueButton: {
    backgroundColor: '#23E51B',
    borderColor: '#11680D',
  },

  shareButton: {
    backgroundColor: '#D78917',
    borderColor: '#7A4300',
  },

  continueIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  resultWrap: {
    alignItems: 'center',
  },

  resultHeader: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
  },

  resultHeaderSmall: {
    fontSize: 18,
    marginBottom: 12,
  },

  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 2,
    borderColor: '#2A1700',
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
  },

  resultNameBox: {
    width: '100%',
    minHeight: 66,
    backgroundColor: '#F0C869',
    borderWidth: 2,
    borderColor: '#8C4B00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  resultNameText: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultNameTextSmall: {
    fontSize: 15,
  },

  resultSubText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },

  resultSubTextSmall: {
    fontSize: 14,
  },
});