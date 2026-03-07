import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Share,
  ActivityIndicator,
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

type Props = NativeStackScreenProps<RootStackParamList, 'AskRiver'>;

const BG = require('../assets/ask_river_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');

type AskStep = 'form' | 'loader' | 'result';

const ANSWERS = ['YES', 'NO'] as const;

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function AskRiverScreen({ navigation }: Props) {
  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [step, setStep] = useState<AskStep>('form');
  const [answer, setAnswer] = useState<'YES' | 'NO'>('YES');

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(22)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 680;
  const isTiny = height < 630;

  const panelWidth = useMemo(() => Math.min(width - 32, isTiny ? 312 : 340), [width, isTiny]);
  const keySize = isTiny ? 24 : isVerySmall ? 26 : 28;
  const keyFont = isTiny ? 10 : 12;
  const actionButtonWidth = isTiny ? 156 : 170;
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
    if (question.length >= 48) {
      return;
    }
    setQuestion(prev => prev + key);
  };

  const addSpace = () => {
    if (!question.length || question.endsWith(' ') || question.length >= 48) {
      return;
    }
    setQuestion(prev => prev + ' ');
  };

  const removeLast = () => {
    setQuestion(prev => prev.slice(0, -1));
  };

  const clearCurrent = () => {
    setQuestion('');
  };

  const handleStart = () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      Alert.alert('Empty question', 'Please enter your question.');
      return;
    }

    setSubmittedQuestion(trimmedQuestion);
    setStep('loader');

    setTimeout(() => {
      const randomAnswer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(randomAnswer);
      setStep('result');
    }, 1800);
  };

  const handleNewQuestion = () => {
    setQuestion('');
    setSubmittedQuestion('');
    setStep('form');
  };

  const handleShare = async () => {
    try {
      const resultLine =
        answer === 'YES'
          ? 'Result: A positive answer appeared.'
          : 'Result: The answer suggests waiting or reconsidering.';

      await Share.share({
        message: `Ask River\nQuestion: ${submittedQuestion}\nAnswer: ${answer}\n${resultLine}`,
      });
    } catch (error) {}
  };

  const handleBack = () => {
    navigation.replace('Menu');
  };

  const resultDescription =
    answer === 'YES'
      ? 'The answer points toward a positive direction.'
      : 'This may not be the best moment to move forward.';

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
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
              ASK RIVER
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
                  Ask one clear question and receive a simple answer.
                </Text>

                <View style={[styles.inputBox, isTiny && styles.inputBoxTiny]}>
                  <Text style={styles.inputLabel}>Your question</Text>
                  <Text
                    style={[
                      styles.inputValue,
                      isTiny && styles.inputValueTiny,
                      !question && styles.placeholderText,
                    ]}
                  >
                    {question || 'Should I move forward with this plan'}
                  </Text>
                </View>

                <View style={styles.keyboardWrap}>
                  <Text style={styles.keyboardTitle}>ENTER YOUR QUESTION</Text>

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
                    styles.startButton,
                    { width: actionButtonWidth, height: actionButtonHeight },
                  ]}
                  onPress={handleStart}
                >
                  <Text style={styles.actionButtonText}>GET ANSWER</Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
          )}

          {step === 'loader' && (
            <Animated.View
              style={[
                styles.loaderWrap,
                {
                  marginTop: isVerySmall ? 90 : 120,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={[styles.loaderText, isVerySmall && styles.loaderTextSmall]}>
                Preparing your answer...
              </Text>
            </Animated.View>
          )}

          {step === 'result' && (
            <Animated.View
              style={[
                styles.resultWrap,
                {
                  width: panelWidth,
                  marginTop: isVerySmall ? 20 : 30,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.resultQuestionBox}>
                <Text
                  style={[styles.questionText, isVerySmall && styles.questionTextSmall]}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                >
                  {submittedQuestion}
                </Text>
              </View>

              <Text
                style={[
                  styles.answerText,
                  answer === 'YES' ? styles.answerYes : styles.answerNo,
                  isVerySmall && styles.answerTextSmall,
                ]}
              >
                {answer}
              </Text>

              <Text style={[styles.resultDescription, isVerySmall && styles.resultDescriptionSmall]}>
                {resultDescription}
              </Text>

              <Pressable
                style={[
                  styles.actionButton,
                  styles.startButton,
                  { width: actionButtonWidth, height: actionButtonHeight, marginTop: 18 },
                ]}
                onPress={handleNewQuestion}
              >
                <Text style={styles.actionButtonText}>ASK AGAIN</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.actionButton,
                  styles.shareButton,
                  { width: actionButtonWidth, height: actionButtonHeight },
                ]}
                onPress={handleShare}
              >
                <Text style={styles.actionButtonText}>SHARE</Text>
              </Pressable>
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
    color: '#08110F',
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
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 25,
  },

  formTitleSmall: {
    fontSize: 17,
    marginBottom: 14,
    lineHeight: 22,
  },

  inputBox: {
    width: '100%',
    minHeight: 64,
    borderWidth: 2,
    borderColor: '#8C4B00',
    backgroundColor: '#F0C869',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    justifyContent: 'center',
  },

  inputBoxTiny: {
    minHeight: 58,
    marginBottom: 8,
  },

  inputLabel: {
    color: '#6E4707',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },

  inputValue: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },

  inputValueTiny: {
    fontSize: 13,
    lineHeight: 16,
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

  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderText: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  loaderTextSmall: {
    fontSize: 14,
    marginTop: 12,
  },

  resultWrap: {
    alignItems: 'center',
  },

  resultQuestionBox: {
    width: '100%',
    minHeight: 88,
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  questionText: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },

  questionTextSmall: {
    fontSize: 16,
  },

  answerText: {
    marginTop: 12,
    fontSize: 72,
    lineHeight: 84,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },

  answerTextSmall: {
    fontSize: 60,
    lineHeight: 70,
  },

  answerYes: {
    color: '#21E51B',
  },

  answerNo: {
    color: '#F02020',
  },

  resultDescription: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 10,
  },

  resultDescriptionSmall: {
    fontSize: 13,
    lineHeight: 18,
  },

  actionButton: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  startButton: {
    marginTop: 8,
    backgroundColor: '#23E51B',
    borderColor: '#11680D',
  },

  shareButton: {
    marginTop: 12,
    backgroundColor: '#D78917',
    borderColor: '#7A4300',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});