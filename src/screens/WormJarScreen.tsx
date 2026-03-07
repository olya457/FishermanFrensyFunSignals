import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WormJar'>;
type ScreenStep = 'menu' | 'detail';
type UnlockType = 'fact' | 'tip';

type UnlockItem = {
  id: number;
  title: string;
  text: string;
  type: UnlockType;
};

const BG = require('../assets/loader_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');
const WORM_ICON = require('../assets/worm_icon.png');

const STORAGE_TOTAL_WORMS = 'river_total_worms';

const FACT_COST = 20;
const TIP_COST = 40;

const FISHING_FACTS: string[] = [
  'Fish can remember safe feeding places for months.',
  'Many fish are more active during sunrise and sunset.',
  'Fish can feel vibrations in water from far away.',
  'Some fish sleep with their eyes open.',
  'Fish often return to the same hiding spots.',
  'Larger fish usually stay deeper than smaller fish.',
  'Fish react strongly to sudden movements above water.',
  'Water temperature affects fish activity levels.',
  'Fish can detect pressure changes in water.',
  'Some fish stop feeding during rapid weather changes.',
  'Fish prefer shaded areas during bright sunlight.',
  'Calm water often makes fish more cautious.',
  'Fish rely more on vibration than sight in murky water.',
  'Many fish feed more actively before rain.',
  'Fish avoid areas with constant loud disturbance.',
  'Certain fish become more active at night.',
  'Fish often gather near underwater structures.',
  'Oxygen levels in water affect fish movement.',
  'Fish can learn to avoid repeated danger.',
  'Fish often patrol the same routes daily.',
];

const FISHING_TIPS: string[] = [
  'Move slowly near the water to avoid scaring fish.',
  'Early morning is one of the best fishing times.',
  'Cast near structures like rocks or fallen trees.',
  'Avoid making shadows over the water.',
  'Use natural-looking bait movement.',
  'Stay quiet and avoid sudden motions.',
  'Try different depths if fish are not biting.',
  'Fish often stay near cooler water areas.',
  'Watch for small ripples on the surface.',
  'Be patient and avoid constant casting.',
  'Change bait if nothing happens for a while.',
  'Fish often hide near edges between light and shade.',
  'Keep your movements smooth and slow.',
  'Observe water for signs of activity.',
  'Fish may bite more after weather stabilizes.',
  'Avoid overly bright or unnatural bait colors.',
  'Try casting along the shoreline.',
  'Fish tend to face into the current.',
  'Stay still and let the environment calm down.',
  'Confidence and patience improve fishing success.',
];

function buildItems(): UnlockItem[] {
  const facts = FISHING_FACTS.map((text, index) => ({
    id: index + 1,
    title: `FISHING FACT #${index + 1}`,
    text,
    type: 'fact' as const,
  }));

  const tips = FISHING_TIPS.map((text, index) => ({
    id: index + 1,
    title: `FISHING TIP #${index + 1}`,
    text,
    type: 'tip' as const,
  }));

  return [...facts, ...tips];
}

const ALL_ITEMS = buildItems();

export default function WormJarScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [worms, setWorms] = useState(0);
  const [step, setStep] = useState<ScreenStep>('menu');
  const [selectedItem, setSelectedItem] = useState<UnlockItem | null>(null);
  const [selectedType, setSelectedType] = useState<UnlockType>('fact');
  const [saving, setSaving] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(16)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(24)).current;
  const contentScale = useRef(new Animated.Value(0.985)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 680;
  const isTiny = height < 630;

  const panelWidth = useMemo(() => {
    if (isTiny) {
      return Math.min(width - 24, 306);
    }
    if (isVerySmall) {
      return Math.min(width - 28, 322);
    }
    if (isSmall) {
      return Math.min(width - 30, 334);
    }
    return Math.min(width - 32, 346);
  }, [width, isTiny, isVerySmall, isSmall]);

  const topWormBoxWidth = isTiny ? 134 : isVerySmall ? 142 : isSmall ? 148 : 156;
  const topWormBoxHeight = isTiny ? 50 : isVerySmall ? 54 : 60;
  const topWormIconSize = isTiny ? 28 : isVerySmall ? 30 : 34;

  const menuCardMinHeight = isTiny ? 92 : isVerySmall ? 102 : 116;
  const menuCardPaddingX = isTiny ? 12 : isVerySmall ? 14 : 18;
  const menuCardGap = isTiny ? 12 : isVerySmall ? 14 : 18;

  const priceButtonWidth = isTiny ? 130 : isVerySmall ? 138 : 160;
  const priceButtonHeight = isTiny ? 50 : isVerySmall ? 58 : 70;

  const detailCardPaddingX = isTiny ? 14 : isVerySmall ? 16 : 18;
  const detailCardPaddingTop = isTiny ? 18 : isVerySmall ? 22 : 28;
  const detailCardPaddingBottom = isTiny ? 16 : isVerySmall ? 18 : 22;

  const unlockButtonWidth = isTiny ? 164 : isVerySmall ? 176 : 196;
  const unlockButtonHeight = isTiny ? 50 : isVerySmall ? 56 : 64;

  const shareButtonWidth = isTiny ? 164 : isVerySmall ? 176 : 196;
  const shareButtonHeight = isTiny ? 48 : isVerySmall ? 54 : 62;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadWorms = async () => {
        try {
          const wormsRaw = await AsyncStorage.getItem(STORAGE_TOTAL_WORMS);
          const totalWorms = wormsRaw ? Number(wormsRaw) : 0;

          if (!active) {
            return;
          }

          setWorms(totalWorms);
        } catch (error) {}
      };

      loadWorms();

      return () => {
        active = false;
      };
    }, []),
  );

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
  }, [step, selectedItem, contentOpacity, contentTranslateY, contentScale]);

  const handleBack = () => {
    if (step === 'detail') {
      setStep('menu');
      return;
    }
    navigation.replace('Menu');
  };

  const getRandomItem = (type: UnlockType): UnlockItem => {
    const filtered = ALL_ITEMS.filter(item => item.type === type);
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  };

  const unlockItem = async (type: UnlockType) => {
    if (saving) {
      return;
    }

    const cost = type === 'fact' ? FACT_COST : TIP_COST;

    if (worms < cost) {
      Alert.alert('Not enough worms', `You need ${cost} worms to unlock this.`);
      return;
    }

    try {
      setSaving(true);

      const updatedWorms = worms - cost;
      const randomItem = getRandomItem(type);

      await AsyncStorage.setItem(STORAGE_TOTAL_WORMS, String(updatedWorms));

      setWorms(updatedWorms);
      setSelectedItem(randomItem);
      setSelectedType(type);
      setStep('detail');
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock item.');
    } finally {
      setSaving(false);
    }
  };

  const unlockNewFromSameType = async () => {
    await unlockItem(selectedType);
  };

  const handleShare = async () => {
    if (!selectedItem) {
      return;
    }

    try {
      await Share.share({
        message: `${selectedItem.title}\n\n${selectedItem.text}`,
      });
    } catch (error) {}
  };

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      {step === 'detail' && <View style={styles.darkOverlay} />}

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.root}>
          <Animated.View
            style={[
              styles.header,
              {
                width: panelWidth,
                marginTop: insets.top + 6,
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={[styles.headerTitle, isVerySmall && styles.headerTitleSmall]}>
              WORM JAR
            </Text>
          </Animated.View>

          <ScrollView
            style={styles.flexFull}
            contentContainerStyle={{
              alignItems: 'center',
              paddingBottom: Math.max(insets.bottom, 18) + 18,
            }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View
              style={[
                step === 'menu' ? styles.menuWrap : styles.detailWrap,
                {
                  width: panelWidth,
                  marginTop: isTiny ? 14 : isVerySmall ? 18 : 22,
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }, { scale: contentScale }],
                },
              ]}
            >
              <View
                style={[
                  styles.topWormBox,
                  {
                    width: topWormBoxWidth,
                    minHeight: topWormBoxHeight,
                  },
                ]}
              >
                <Image
                  source={WORM_ICON}
                  style={{ width: topWormIconSize, height: topWormIconSize }}
                  resizeMode="contain"
                />
                <Text style={[styles.topWormValue, isTiny && styles.topWormValueTiny]}>
                  {worms}
                </Text>
              </View>

              {step === 'menu' && (
                <>
                  <Pressable
                    style={[
                      styles.menuItem,
                      {
                        minHeight: menuCardMinHeight,
                        marginTop: isTiny ? 16 : 22,
                        paddingHorizontal: menuCardPaddingX,
                      },
                    ]}
                    onPress={() => unlockItem('fact')}
                  >
                    <Text style={[styles.menuItemTitle, isTiny && styles.menuItemTitleTiny]}>
                      Fishing Fact (1x)
                    </Text>

                    <View
                      style={[
                        styles.priceButton,
                        {
                          width: priceButtonWidth,
                          height: priceButtonHeight,
                        },
                      ]}
                    >
                      <Image
                        source={WORM_ICON}
                        style={[
                          styles.priceWormIcon,
                          isTiny && styles.priceWormIconTiny,
                        ]}
                        resizeMode="contain"
                      />
                      <Text style={[styles.priceValue, isTiny && styles.priceValueTiny]}>20</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.menuItem,
                      {
                        minHeight: menuCardMinHeight,
                        marginTop: menuCardGap,
                        paddingHorizontal: menuCardPaddingX,
                      },
                    ]}
                    onPress={() => unlockItem('tip')}
                  >
                    <Text style={[styles.menuItemTitle, isTiny && styles.menuItemTitleTiny]}>
                      Fishing Tip (1x)
                    </Text>

                    <View
                      style={[
                        styles.priceButton,
                        {
                          width: priceButtonWidth,
                          height: priceButtonHeight,
                        },
                      ]}
                    >
                      <Image
                        source={WORM_ICON}
                        style={[
                          styles.priceWormIcon,
                          isTiny && styles.priceWormIconTiny,
                        ]}
                        resizeMode="contain"
                      />
                      <Text style={[styles.priceValue, isTiny && styles.priceValueTiny]}>40</Text>
                    </View>
                  </Pressable>
                </>
              )}

              {step === 'detail' && selectedItem && (
                <View
                  style={[
                    styles.detailCard,
                    {
                      marginTop: isTiny ? 16 : 22,
                      paddingHorizontal: detailCardPaddingX,
                      paddingTop: detailCardPaddingTop,
                      paddingBottom: detailCardPaddingBottom,
                    },
                  ]}
                >
                  <Text style={[styles.detailTitle, isTiny && styles.detailTitleTiny]}>
                    {selectedItem.title}
                  </Text>

                  <Text style={[styles.detailText, isTiny && styles.detailTextTiny]}>
                    {selectedItem.text}
                  </Text>

                  <Pressable
                    style={[
                      styles.unlockNewButton,
                      {
                        width: unlockButtonWidth,
                        height: unlockButtonHeight,
                        marginTop: isTiny ? 20 : 30,
                      },
                    ]}
                    onPress={unlockNewFromSameType}
                  >
                    <Text
                      style={[
                        styles.unlockNewButtonText,
                        isTiny && styles.unlockNewButtonTextTiny,
                      ]}
                    >
                      {selectedType === 'fact' ? 'NEW FACT' : 'NEW TIP'}
                    </Text>

                    <Image
                      source={WORM_ICON}
                      style={[
                        styles.unlockNewWormIcon,
                        isTiny && styles.unlockNewWormIconTiny,
                      ]}
                      resizeMode="contain"
                    />

                    <Text style={[styles.unlockNewPrice, isTiny && styles.unlockNewPriceTiny]}>
                      {selectedType === 'fact' ? FACT_COST : TIP_COST}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.shareButton,
                      {
                        width: shareButtonWidth,
                        height: shareButtonHeight,
                        marginTop: isTiny ? 12 : 16,
                      },
                    ]}
                    onPress={handleShare}
                  >
                    <Text style={[styles.shareButtonText, isTiny && styles.shareButtonTextTiny]}>
                      SHARE
                    </Text>
                  </Pressable>
                </View>
              )}
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

  flexFull: {
    width: '100%',
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
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

  menuWrap: {
    alignItems: 'center',
  },

  detailWrap: {
    alignItems: 'center',
  },

  topWormBox: {
    backgroundColor: '#F4C861',
    borderWidth: 2,
    borderColor: '#9A5B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },

  topWormValue: {
    marginLeft: 10,
    color: '#000000',
    fontSize: 21,
    fontWeight: '900',
  },

  topWormValueTiny: {
    fontSize: 18,
    marginLeft: 8,
  },

  menuItem: {
    width: '100%',
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuItemTitle: {
    flex: 1,
    color: '#111111',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    paddingRight: 12,
  },

  menuItemTitleTiny: {
    fontSize: 15,
    lineHeight: 20,
    paddingRight: 8,
  },

  priceButton: {
    backgroundColor: '#18E61B',
    borderWidth: 2,
    borderColor: '#11680D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priceWormIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
  },

  priceWormIconTiny: {
    width: 26,
    height: 26,
    marginRight: 6,
  },

  priceValue: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },

  priceValueTiny: {
    fontSize: 16,
  },

  detailCard: {
    width: '100%',
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    alignItems: 'center',
  },

  detailTitle: {
    color: '#111111',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    textAlign: 'center',
  },

  detailTitleTiny: {
    fontSize: 16,
    lineHeight: 21,
  },

  detailText: {
    marginTop: 28,
    color: '#111111',
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },

  detailTextTiny: {
    marginTop: 22,
    fontSize: 14,
    lineHeight: 21,
  },

  unlockNewButton: {
    backgroundColor: '#18E61B',
    borderWidth: 2,
    borderColor: '#11680D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  unlockNewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  unlockNewButtonTextTiny: {
    fontSize: 13,
  },

  unlockNewWormIcon: {
    width: 30,
    height: 30,
    marginLeft: 12,
    marginRight: 8,
  },

  unlockNewWormIconTiny: {
    width: 24,
    height: 24,
    marginLeft: 8,
    marginRight: 5,
  },

  unlockNewPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  unlockNewPriceTiny: {
    fontSize: 15,
  },

  shareButton: {
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
    fontSize: 13,
  },
});