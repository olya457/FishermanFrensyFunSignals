import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Mood'>;

const BG = require('../assets/loader_bg.png');
const WORM_ICON = require('../assets/worm_icon.png');

const STORAGE_TOTAL_WORMS = 'river_total_worms';
const STORAGE_SELECTED_MOOD = 'river_selected_mood';
const STORAGE_MOOD_REWARD_PREFIX = 'river_mood_reward_claimed_';

type MoodType = 'Funny' | 'Neutral' | 'Sad';
type StepType = 'pick' | 'reward';

const MOOD_REWARDS: Record<MoodType, number> = {
  Funny: 20,
  Neutral: 20,
  Sad: 20,
};

function getTodayRewardKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `${STORAGE_MOOD_REWARD_PREFIX}${today}`;
}

export default function MoodScreen({ navigation }: Props) {
  const [step, setStep] = useState<StepType>('pick');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [saving, setSaving] = useState(false);

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 760;
  const isVerySmall = height < 680;

  const cardWidth = useMemo(() => Math.min(width - 44, 320), [width]);
  const reward = selectedMood ? MOOD_REWARDS[selectedMood] : 20;

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    setStep('reward');
  };

  const handleClaimReward = async () => {
    if (!selectedMood || saving) {
      return;
    }

    try {
      setSaving(true);

      const rewardKey = getTodayRewardKey();
      const alreadyClaimed = await AsyncStorage.getItem(rewardKey);

      await AsyncStorage.setItem(STORAGE_SELECTED_MOOD, selectedMood);

      if (!alreadyClaimed) {
        const wormsRaw = await AsyncStorage.getItem(STORAGE_TOTAL_WORMS);
        const currentWorms = wormsRaw ? Number(wormsRaw) : 0;
        const nextWorms = currentWorms + reward;

        await AsyncStorage.multiSet([
          [STORAGE_TOTAL_WORMS, String(nextWorms)],
          [rewardKey, '1'],
        ]);
      }

      navigation.replace('Menu');
    } catch (e) {
      Alert.alert('Error', 'Failed to save your reward.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    navigation.replace('Menu');
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          {step === 'pick' ? (
            <View
              style={[
                styles.centerCard,
                {
                  width: cardWidth,
                  marginBottom: Math.max(insets.bottom, 16) + 36,
                  paddingVertical: isVerySmall ? 22 : 28,
                },
              ]}
            >
              <Text style={[styles.cardTitle, isSmall && styles.cardTitleSmall]}>
                How do you feel today?
              </Text>

              <Pressable
                style={[styles.moodButton, styles.greenButton]}
                onPress={() => handleSelectMood('Funny')}
              >
                <Text style={styles.moodButtonText}>Funny</Text>
              </Pressable>

              <Pressable
                style={[styles.moodButton, styles.orangeButton]}
                onPress={() => handleSelectMood('Neutral')}
              >
                <Text style={styles.moodButtonText}>Neutral</Text>
              </Pressable>

              <Pressable
                style={[styles.moodButton, styles.redButton]}
                onPress={() => handleSelectMood('Sad')}
              >
                <Text style={styles.moodButtonText}>Sad</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.rewardScreen}>
              <Text style={[styles.rewardTitle, isSmall && styles.rewardTitleSmall]}>
                DAILY WORM COLLECTED
              </Text>

              <View style={styles.rewardRow}>
                <Image
                  source={WORM_ICON}
                  style={[
                    styles.wormImage,
                    isVerySmall && styles.wormImageVerySmall,
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.rewardCount, isVerySmall && styles.rewardCountSmall]}>
                  x{reward}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.claimButton,
                  saving && styles.claimButtonDisabled,
                ]}
                onPress={handleClaimReward}
                disabled={saving}
              >
                <Text style={styles.claimButtonText}>
                  {saving ? 'LOADING...' : 'GET'}
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
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
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  safe: {
    flex: 1,
  },

  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  centerCard: {
    backgroundColor: '#E8C36B',
    borderWidth: 2,
    borderColor: '#6D3A00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  cardTitle: {
    color: '#111111',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
  },

  cardTitleSmall: {
    fontSize: 18,
    lineHeight: 23,
    marginBottom: 20,
  },

  moodButton: {
    width: '100%',
    height: 66,
    borderWidth: 2,
    borderColor: '#2E1A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  greenButton: {
    backgroundColor: '#21E31B',
  },

  orangeButton: {
    backgroundColor: '#D98A16',
  },

  redButton: {
    backgroundColor: '#FF1E1E',
  },

  moodButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  rewardScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },

  rewardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 26,
  },

  rewardTitleSmall: {
    fontSize: 19,
    marginBottom: 22,
  },

  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  wormImage: {
    width: 170,
    height: 210,
    marginRight: 8,
  },

  wormImageVerySmall: {
    width: 140,
    height: 175,
  },

  rewardCount: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },

  rewardCountSmall: {
    fontSize: 28,
  },

  claimButton: {
    width: 174,
    height: 60,
    backgroundColor: '#D98A16',
    borderWidth: 2,
    borderColor: '#6D3A00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  claimButtonDisabled: {
    opacity: 0.7,
  },

  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  closeButton: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});