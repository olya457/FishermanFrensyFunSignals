import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Share,
  useWindowDimensions,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { STORY_QUIZ_LEVELS, type QuizLevel } from '../data/storyQuizLevels';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyQuiz'>;
type ScreenStep = 'quiz' | 'levelComplete';

type SavedQuizProgress = {
  levelIndex: number;
  questionIndex: number;
  totalCorrectAnswers: number;
  totalWormsEarned: number;
  completedLevels: number[];
};

const BG = require('../assets/ask_river_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');
const WORM_ICON = require('../assets/worm_icon.png');

const STORAGE_TOTAL_WORMS = 'river_total_worms';
const STORAGE_LEVEL_QUIZ_PROGRESS = 'river_level_quiz_progress_v2';

export default function DailyQuizScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [step, setStep] = useState<ScreenStep>('quiz');
  const [levelIndex, setLevelIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | null>(null);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [totalWormsEarned, setTotalWormsEarned] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [lastLevelReward, setLastLevelReward] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(24)).current;
  const contentScale = useRef(new Animated.Value(0.985)).current;

  const isVerySmall = height < 680;
  const isTiny = height < 630;

  const panelWidth = useMemo(() => {
    if (isTiny) {
      return Math.min(width - 20, 308);
    }
    if (isVerySmall) {
      return Math.min(width - 26, 326);
    }
    return Math.min(width - 32, 346);
  }, [width, isTiny, isVerySmall]);

  const currentLevel: QuizLevel = STORY_QUIZ_LEVELS[levelIndex];
  const currentQuestion = currentLevel.questions[questionIndex];
  const progressText = `${questionIndex + 1}/${currentLevel.questions.length}`;
  const levelText = `Level ${levelIndex + 1}/${STORY_QUIZ_LEVELS.length}`;
  const hasNextLevel = levelIndex < STORY_QUIZ_LEVELS.length - 1;

  useEffect(() => {
    headerOpacity.setValue(0);
    headerTranslateY.setValue(16);

    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  useEffect(() => {
    contentOpacity.setValue(0);
    contentTranslateY.setValue(24);
    contentScale.setValue(0.985);

    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentScale, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [levelIndex, questionIndex, step, contentOpacity, contentTranslateY, contentScale]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedRaw = await AsyncStorage.getItem(STORAGE_LEVEL_QUIZ_PROGRESS);

        if (!savedRaw) {
          setLoadingProgress(false);
          return;
        }

        const saved: SavedQuizProgress = JSON.parse(savedRaw);

        if (
          typeof saved.levelIndex === 'number' &&
          typeof saved.questionIndex === 'number' &&
          typeof saved.totalCorrectAnswers === 'number' &&
          typeof saved.totalWormsEarned === 'number' &&
          Array.isArray(saved.completedLevels) &&
          saved.levelIndex >= 0 &&
          saved.levelIndex < STORY_QUIZ_LEVELS.length &&
          saved.questionIndex >= 0 &&
          saved.questionIndex < STORY_QUIZ_LEVELS[saved.levelIndex].questions.length
        ) {
          setLevelIndex(saved.levelIndex);
          setQuestionIndex(saved.questionIndex);
          setTotalCorrectAnswers(saved.totalCorrectAnswers);
          setTotalWormsEarned(saved.totalWormsEarned);
          setCompletedLevels(saved.completedLevels);
        }
      } catch (error) {
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, []);

  const saveProgress = async (
    nextLevelIndex: number,
    nextQuestionIndex: number,
    nextCorrectAnswers: number,
    nextTotalWorms: number,
    nextCompletedLevels: number[],
  ) => {
    const payload: SavedQuizProgress = {
      levelIndex: nextLevelIndex,
      questionIndex: nextQuestionIndex,
      totalCorrectAnswers: nextCorrectAnswers,
      totalWormsEarned: nextTotalWorms,
      completedLevels: nextCompletedLevels,
    };

    await AsyncStorage.setItem(STORAGE_LEVEL_QUIZ_PROGRESS, JSON.stringify(payload));
  };

  const clearProgress = async () => {
    await AsyncStorage.removeItem(STORAGE_LEVEL_QUIZ_PROGRESS);
  };

  const addWormsToStorage = async (amount: number) => {
    const wormsRaw = await AsyncStorage.getItem(STORAGE_TOTAL_WORMS);
    const currentWorms = wormsRaw ? Number(wormsRaw) : 0;
    const nextWorms = currentWorms + amount;
    await AsyncStorage.setItem(STORAGE_TOTAL_WORMS, String(nextWorms));
  };

  const handleBack = () => {
    if (saving || loadingProgress) {
      return;
    }
    navigation.replace('Menu');
  };

  const handleAnswer = (optionId: 'A' | 'B' | 'C') => {
    if (selectedOption || saving || loadingProgress) {
      return;
    }

    setSelectedOption(optionId);

    const isCorrect = optionId === currentQuestion.correct;
    const nextCorrectAnswers = isCorrect ? totalCorrectAnswers + 1 : totalCorrectAnswers;
    const isLastQuestionInLevel = questionIndex === currentLevel.questions.length - 1;

    setTimeout(async () => {
      try {
        if (!isLastQuestionInLevel) {
          const nextQuestionIndex = questionIndex + 1;

          await saveProgress(
            levelIndex,
            nextQuestionIndex,
            nextCorrectAnswers,
            totalWormsEarned,
            completedLevels,
          );

          setTotalCorrectAnswers(nextCorrectAnswers);
          setQuestionIndex(nextQuestionIndex);
          setSelectedOption(null);
          return;
        }

        const rewardForLevel = currentLevel.reward;
        const nextTotalWorms = totalWormsEarned + rewardForLevel;
        const nextCompletedLevels = completedLevels.includes(currentLevel.id)
          ? completedLevels
          : [...completedLevels, currentLevel.id];

        await addWormsToStorage(rewardForLevel);

        if (hasNextLevel) {
          await saveProgress(
            levelIndex + 1,
            0,
            nextCorrectAnswers,
            nextTotalWorms,
            nextCompletedLevels,
          );
        } else {
          await clearProgress();
        }

        setTotalCorrectAnswers(nextCorrectAnswers);
        setTotalWormsEarned(nextTotalWorms);
        setCompletedLevels(nextCompletedLevels);
        setLastLevelReward(rewardForLevel);
        setStep('levelComplete');
        setSelectedOption(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to save quiz progress.');
        setSelectedOption(null);
      }
    }, 280);
  };

  const handleNextLevel = () => {
    if (!hasNextLevel) {
      navigation.replace('Menu');
      return;
    }

    setLevelIndex(prev => prev + 1);
    setQuestionIndex(0);
    setStep('quiz');
  };

  const handleExit = () => {
    navigation.replace('Menu');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Story Quiz\nCompleted levels: ${completedLevels.length}/${STORY_QUIZ_LEVELS.length}\nCorrect answers: ${totalCorrectAnswers}\nWorms earned: ${totalWormsEarned}`,
      });
    } catch (error) {}
  };

  const getOptionStyle = (optionId: 'A' | 'B' | 'C') => {
    if (!selectedOption) {
      return styles.optionButton;
    }

    if (optionId === currentQuestion.correct) {
      return [styles.optionButton, styles.optionButtonCorrect];
    }

    if (optionId === selectedOption && optionId !== currentQuestion.correct) {
      return [styles.optionButton, styles.optionButtonWrong];
    }

    return [styles.optionButton, styles.optionButtonDim];
  };

  if (loadingProgress) {
    return (
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.loadingRoot}>
            <ActivityIndicator color="#FFFFFF" size="large" />
            <Text style={styles.loadingText}>Loading quiz progress...</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      {step === 'levelComplete' && <View style={styles.resultOverlay} />}

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          <Animated.View
            style={[
              styles.header,
              {
                width: panelWidth,
                marginTop: insets.top + 4,
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={[styles.headerTitle, isVerySmall && styles.headerTitleSmall]}>
              STORY QUIZ
            </Text>
          </Animated.View>

          {step === 'quiz' && (
            <ScrollView
              style={styles.flexFull}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: Math.max(insets.bottom, 16) + 12,
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.quizCard,
                  {
                    width: panelWidth,
                    marginTop: isTiny ? 14 : isVerySmall ? 18 : 24,
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }, { scale: contentScale }],
                    paddingTop: isTiny ? 14 : 16,
                    paddingHorizontal: isTiny ? 12 : 14,
                    paddingBottom: isTiny ? 14 : 16,
                  },
                ]}
              >
                <Text style={[styles.quizTitle, isTiny && styles.quizTitleTiny]}>STORY QUIZ</Text>

                <View style={styles.levelInfoBox}>
                  <Text style={[styles.levelInfoText, isTiny && styles.levelInfoTextTiny]}>
                    {levelText}
                  </Text>
                  <Text style={[styles.levelInfoSubText, isTiny && styles.levelInfoSubTextTiny]}>
                    {currentLevel.title}
                  </Text>
                </View>

                <View style={styles.questionCard}>
                  <Text
                    style={[
                      styles.questionText,
                      isTiny && styles.questionTextTiny,
                      isVerySmall && !isTiny && styles.questionTextSmall,
                    ]}
                  >
                    {currentQuestion.question}
                  </Text>

                  <View style={[styles.rewardRow, isTiny && styles.rewardRowTiny]}>
                    <Text style={[styles.rewardText, isTiny && styles.rewardTextTiny]}>
                      10 questions in this level.{'\n'}
                      Reward for completion: +{currentLevel.reward} worms
                    </Text>

                    <Image
                      source={WORM_ICON}
                      style={[styles.rewardWorm, isTiny && styles.rewardWormTiny]}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.progressRow}>
                    <Text style={[styles.progressText, isTiny && styles.progressTextTiny]}>
                      Question: {progressText}
                    </Text>
                    <Text style={[styles.progressText, isTiny && styles.progressTextTiny]}>
                      Completed levels: {completedLevels.length}/{STORY_QUIZ_LEVELS.length}
                    </Text>
                  </View>
                </View>

                <View style={[styles.optionsWrap, { marginTop: isTiny ? 12 : 16 }]}>
                  {currentQuestion.options.map(option => (
                    <Pressable
                      key={option.id}
                      style={[
                        getOptionStyle(option.id),
                        {
                          minHeight: isTiny ? 50 : isVerySmall ? 56 : 62,
                          marginBottom: isTiny ? 8 : 10,
                          paddingHorizontal: isTiny ? 10 : 12,
                          paddingVertical: isTiny ? 8 : 10,
                        },
                      ]}
                      onPress={() => handleAnswer(option.id)}
                    >
                      <Text style={[styles.optionText, isTiny && styles.optionTextTiny]}>
                        {option.id}) {option.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            </ScrollView>
          )}

          {step === 'levelComplete' && (
            <ScrollView
              style={styles.flexFull}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: Math.max(insets.bottom, 16) + 12,
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.resultWrap,
                  {
                    width: panelWidth,
                    marginTop: isTiny ? 14 : isVerySmall ? 18 : 24,
                    opacity: contentOpacity,
                    transform: [{ translateY: contentTranslateY }, { scale: contentScale }],
                  },
                ]}
              >
                <Text style={[styles.resultTopTitle, isTiny && styles.resultTopTitleTiny]}>
                  LEVEL COMPLETE
                </Text>

                <Text style={[styles.resultPassedText, isTiny && styles.resultPassedTextTiny]}>
                  {currentLevel.title}
                </Text>

                <View style={styles.resultQuestionPreview}>
                  <Text
                    style={[
                      styles.resultQuestionPreviewText,
                      isTiny && styles.resultQuestionPreviewTextTiny,
                    ]}
                    numberOfLines={3}
                    adjustsFontSizeToFit
                  >
                    Reward added for this level
                  </Text>

                  <View style={styles.resultPreviewMiniBox}>
                    <Text
                      style={[
                        styles.resultPreviewMiniText,
                        isTiny && styles.resultPreviewMiniTextTiny,
                      ]}
                    >
                      Total correct answers: {totalCorrectAnswers}
                    </Text>
                  </View>
                </View>

                <View style={styles.rewardBigRow}>
                  <Image
                    source={WORM_ICON}
                    style={[styles.rewardBigWorm, isTiny && styles.rewardBigWormTiny]}
                    resizeMode="contain"
                  />
                  <Text style={[styles.rewardBigCount, isTiny && styles.rewardBigCountTiny]}>
                    +{lastLevelReward}
                  </Text>
                </View>

                <Text style={[styles.totalRewardText, isTiny && styles.totalRewardTextTiny]}>
                  Total worms earned: {totalWormsEarned}
                </Text>

                <Pressable
                  style={[
                    styles.shareButton,
                    {
                      width: '100%',
                      height: isTiny ? 52 : isVerySmall ? 56 : 60,
                      marginTop: isTiny ? 12 : 16,
                    },
                  ]}
                  onPress={hasNextLevel ? handleNextLevel : handleExit}
                >
                  <Text style={[styles.shareButtonText, isTiny && styles.shareButtonTextTiny]}>
                    {hasNextLevel ? 'NEXT LEVEL' : 'FINISH'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.exitButton,
                    {
                      width: '100%',
                      height: isTiny ? 52 : isVerySmall ? 56 : 60,
                      marginTop: 10,
                    },
                  ]}
                  onPress={handleExit}
                >
                  <Text style={[styles.shareButtonText, isTiny && styles.shareButtonTextTiny]}>
                    EXIT
                  </Text>
                </Pressable>

                <Pressable style={styles.closeButton} onPress={handleShare}>
                  <Text style={[styles.closeText, isTiny && styles.closeTextTiny]}>Share</Text>
                </Pressable>
              </Animated.View>
            </ScrollView>
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

  flexFull: {
    width: '100%',
  },

  scrollContent: {
    width: '100%',
    alignItems: 'center',
  },

  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
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

  quizCard: {
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    alignItems: 'center',
  },

  quizTitle: {
    color: '#111111',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  quizTitleTiny: {
    fontSize: 18,
    marginBottom: 8,
  },

  levelInfoBox: {
    width: '100%',
    backgroundColor: '#DDB75A',
    borderWidth: 2,
    borderColor: '#8C4B00',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },

  levelInfoText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  levelInfoTextTiny: {
    fontSize: 12,
  },

  levelInfoSubText: {
    color: '#6C4100',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  levelInfoSubTextTiny: {
    fontSize: 11,
  },

  questionCard: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#8C4B00',
    backgroundColor: '#EFCB75',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  questionText: {
    color: '#111111',
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900',
  },

  questionTextSmall: {
    fontSize: 15,
    lineHeight: 21,
  },

  questionTextTiny: {
    fontSize: 14,
    lineHeight: 19,
  },

  rewardRow: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#E2BE65',
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rewardRowTiny: {
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  rewardText: {
    flex: 1,
    color: '#111111',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    paddingRight: 8,
  },

  rewardTextTiny: {
    fontSize: 11,
    lineHeight: 15,
  },

  rewardWorm: {
    width: 34,
    height: 34,
  },

  rewardWormTiny: {
    width: 28,
    height: 28,
  },

  progressRow: {
    marginTop: 8,
  },

  progressText: {
    color: '#6C4100',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 2,
  },

  progressTextTiny: {
    fontSize: 11,
  },

  optionsWrap: {
    width: '100%',
  },

  optionButton: {
    width: '100%',
    backgroundColor: '#15E716',
    borderWidth: 2,
    borderColor: '#0C650D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonCorrect: {
    backgroundColor: '#15E716',
    borderColor: '#0C650D',
  },

  optionButtonWrong: {
    backgroundColor: '#E12525',
    borderColor: '#7D0B0B',
  },

  optionButtonDim: {
    opacity: 0.55,
  },

  optionText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
    textAlign: 'center',
  },

  optionTextTiny: {
    fontSize: 12,
    lineHeight: 16,
  },

  resultWrap: {
    alignItems: 'center',
  },

  resultTopTitle: {
    color: '#111111',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultTopTitleTiny: {
    fontSize: 18,
  },

  resultPassedText: {
    marginTop: 16,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultPassedTextTiny: {
    marginTop: 14,
    fontSize: 15,
  },

  resultQuestionPreview: {
    width: '100%',
    marginTop: 14,
    backgroundColor: 'rgba(48,31,4,0.72)',
    borderWidth: 2,
    borderColor: '#2D1900',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  resultQuestionPreviewText: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultQuestionPreviewTextTiny: {
    fontSize: 14,
    lineHeight: 18,
  },

  resultPreviewMiniBox: {
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: '#D4B056',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  resultPreviewMiniText: {
    color: '#111111',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  resultPreviewMiniTextTiny: {
    fontSize: 11,
  },

  rewardBigRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  rewardBigWorm: {
    width: 108,
    height: 136,
    marginRight: 8,
  },

  rewardBigWormTiny: {
    width: 86,
    height: 112,
    marginRight: 6,
  },

  rewardBigCount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },

  rewardBigCountTiny: {
    fontSize: 26,
  },

  totalRewardText: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  totalRewardTextTiny: {
    fontSize: 13,
  },

  shareButton: {
    backgroundColor: '#D78917',
    borderWidth: 2,
    borderColor: '#7A4300',
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitButton: {
    backgroundColor: '#15E716',
    borderWidth: 2,
    borderColor: '#0C650D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  shareButtonTextTiny: {
    fontSize: 13,
  },

  closeButton: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 15,
    textDecorationLine: 'underline',
  },

  closeTextTiny: {
    fontSize: 13,
  },
});