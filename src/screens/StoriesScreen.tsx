import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  ScrollView,
  Share,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Stories'>;
type ScreenMode = 'list' | 'read';

type StoryItem = {
  id: string;
  title: string;
  preview: string;
  fullText: string;
  image: any;
};

const BG = require('../assets/stories_bg.png');
const BACK_ICON = require('../assets/back_arrow.png');

const IMG_FISHERMAN = require('../assets/story_fisherman.png');
const IMG_TOUCAN = require('../assets/story_toucan.png');
const IMG_CIRCLE = require('../assets/story_circle.png');
const IMG_FISH = require('../assets/story_fish.png');

const IMG_BOAT = require('../assets/story_boat.png');
const IMG_FROG = require('../assets/story_frog.png');
const IMG_LANTERN = require('../assets/story_lantern.png');
const IMG_REED = require('../assets/story_reed.png');
const IMG_NET = require('../assets/story_net.png');
const IMG_MOON = require('../assets/story_moon.png');

const STORIES: StoryItem[] = [
  {
    id: 'fisherman',
    title: 'A story from a fisherman',
    preview: 'One day I woke up before the sun....',
    fullText: `One day I woke up before the sun. The river was so quiet that I could hear the worm thinking. I cast my rod and waited. 5 minutes passed. Then 10. Then 30. Suddenly something tugged on the line. I pulled sharply... and pulled out the old shoe.

I looked at him. He looked at me.

We were silent.

I said, "So, you again?"

I let him back into the water. An hour later I pulled him out again.

Now I'm sure - he's watching me.`,
    image: IMG_FISHERMAN,
  },
  {
    id: 'stork',
    title: 'A story from a stork',
    preview: 'People think they are quiet. They are wrong....',
    fullText: `People think they are quiet. They are wrong.

I have been standing here for 3 hours. The fisherman has not noticed me once. But I noticed him looking at his footprint in the water three times and winking to himself once.

The fish under the water laughs at him. I can see it.

He thinks he is a hunter.

But sometimes the river hunts him.

And sometimes... it wins.`,
    image: IMG_TOUCAN,
  },
  {
    id: 'circle',
    title: 'A story from the Lifesaving Circle',
    preview: 'I was new. Clean. Perfectly round....',
    fullText: `I was new. Clean. Perfectly round.

They hung me on a wooden pole by the water. The fisherman looked at me suspiciously.

"I hope I do not need you," he said.

Time passed.

One day he slipped. He did not fall. But I saw the fear in his eyes.

Since that day he has looked at me with respect.

I do not move.

I do not speak.

But he knows.

I am always ready.`,
    image: IMG_CIRCLE,
  },
  {
    id: 'fish',
    title: 'A story from a fish',
    preview: 'I see him every day....',
    fullText: `I see him every day.

He comes early. He thinks I do not know. He thinks he is quiet. But the water tells me everything.

He casts the hook and looks at the surface, as if waiting for a miracle.

One day I swam closer. Very close. I could see his face. He looked confident.

I touched the bait... and swam away.

His reaction was priceless.

The next day he came back.

With a new bait.

With a new hope.

With the same expression on his face.

I do not think he comes because of me.

I think... he just likes being here.

And honestly, I do too.`,
    image: IMG_FISH,
  },
  {
    id: 'boat',
    title: 'A story from an old boat',
    preview: 'My boards creak louder in the morning....',
    fullText: `My boards creak louder in the morning.

The fisherman always steps in carefully, as if I might complain. I do not complain. I only remember.

I remember the first day he pushed me into the water. He was younger then. Faster. Less patient.

Now he sits more quietly. He looks at the river longer. He speaks less.

Sometimes he pats the side of my seat before casting, like I am part of the ritual.

He thinks I carry him.

Maybe that is true.

But on quiet mornings like this, I think we carry each other.`,
    image: IMG_BOAT,
  },
  {
    id: 'frog',
    title: 'A story from a frog',
    preview: 'I live close enough to hear every plan....',
    fullText: `I live close enough to hear every plan.

Every evening someone comes to the bank and says, "Today will be different."

It usually is not.

The fisherman changes bait. Changes place. Changes hat.

The fish stays clever.

The water stays calm.

And I stay on my stone, watching all of them.

Yesterday he looked especially serious. He whispered, "Today I know exactly what I am doing."

That was the moment I slipped into the water laughing.

He still thinks it was a splash from a big fish.`,
    image: IMG_FROG,
  },
  {
    id: 'lantern',
    title: 'A story from a lantern',
    preview: 'I glow when the path back becomes uncertain....',
    fullText: `I glow when the path back becomes uncertain.

The fisherman brings me when the sky is slow to brighten or too quick to darken. He hangs me on a branch and trusts me to hold a little piece of light for him.

I watch the line cut through black water. I watch his shoulders relax after each cast.

He never says much at night.

But once, while packing his gear, he looked at my small circle of light and smiled.

"That was enough," he said.

No big catch. No great story. Just enough.

I think that is why he keeps coming back.`,
    image: IMG_LANTERN,
  },
  {
    id: 'reed',
    title: 'A story from the reeds',
    preview: 'We bend, we whisper, and we notice everything....',
    fullText: `We bend, we whisper, and we notice everything.

The fisherman thinks the bank is empty when he arrives. It never is.

Birds watch from above. Fish wait below. Wind passes messages through us before he even unfolds his chair.

He likes to stand near us because the water is deeper there. Smarter there.

Yesterday he stood perfectly still for 15 minutes. That impressed even us.

Then his phone slipped from his pocket into the grass and he spent 10 minutes searching for it.

The river gives calm.

The bank returns humility.`,
    image: IMG_REED,
  },
  {
    id: 'net',
    title: 'A story from a landing net',
    preview: 'I am always brought along, even when not invited....',
    fullText: `I am always brought along, even when not invited.

Most days I lie beside the bag and wait. The fisherman likes to think positively. I respect that.

He glances at me often, as if checking whether I am ready for greatness.

I am always ready.

Once he pulled me up in a rush, convinced something enormous was on the line. He moved like a hero from a story.

It was a branch.

A very confident branch.

He sat down after that and did not speak for a while.

I did not laugh.

Not out loud.`,
    image: IMG_NET,
  },
  {
    id: 'moon',
    title: 'A story from the moon over the river',
    preview: 'From above, even the patient ones look small....',
    fullText: `From above, even the patient ones look small.

I see the fisherman arrive when the rest of the shore is still deciding whether it is morning or night. He stands in silver light and throws his line into a river that reflects half the sky.

He believes he is searching for fish.

Maybe he is.

But I have watched him long enough to know he also comes for silence, for distance, for the soft sound of water against the bank.

Tonight he caught nothing.

Still, when he left, he turned once more toward the river and nodded, as if thanking it.

That is why the river remembers him.`,
    image: IMG_MOON,
  },
];

export default function StoriesScreen({ navigation }: Props) {
  const [mode, setMode] = useState<ScreenMode>('list');
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(18)).current;

  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslateY = useRef(new Animated.Value(26)).current;
  const listScale = useRef(new Animated.Value(0.985)).current;

  const readOpacity = useRef(new Animated.Value(0)).current;
  const readTranslateY = useRef(new Animated.Value(28)).current;
  const readScale = useRef(new Animated.Value(0.985)).current;

  const isSmall = height < 760;
  const isVerySmall = height < 680;
  const isTiny = height < 630;

  const panelWidth = useMemo(() => {
    if (isTiny) {
      return Math.min(width - 24, 312);
    }
    if (isVerySmall) {
      return Math.min(width - 28, 326);
    }
    return Math.min(width - 32, 344);
  }, [width, isTiny, isVerySmall]);

  const cardImageWidth = isTiny ? 88 : isVerySmall ? 96 : 104;
  const cardImageHeight = isTiny ? 112 : isVerySmall ? 122 : 132;

  const detailImageWidth = isTiny ? 108 : isVerySmall ? 122 : 144;
  const detailImageHeight = isTiny ? 146 : isVerySmall ? 166 : 194;

  const detailTextSize = isTiny ? 13 : isVerySmall ? 14 : 15;
  const detailLineHeight = isTiny ? 21 : isVerySmall ? 23 : 25;

  useEffect(() => {
    headerOpacity.setValue(0);
    headerTranslateY.setValue(18);

    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 440,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerOpacity, headerTranslateY]);

  useEffect(() => {
    if (mode === 'list') {
      listOpacity.setValue(0);
      listTranslateY.setValue(26);
      listScale.setValue(0.985);

      Animated.parallel([
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(listTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(listScale, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mode, listOpacity, listTranslateY, listScale]);

  useEffect(() => {
    if (mode === 'read') {
      readOpacity.setValue(0);
      readTranslateY.setValue(28);
      readScale.setValue(0.985);

      Animated.parallel([
        Animated.timing(readOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(readTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(readScale, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [mode, selectedStory, readOpacity, readTranslateY, readScale]);

  const openStory = (story: StoryItem) => {
    setSelectedStory(story);
    setMode('read');
  };

  const handleBack = () => {
    if (mode === 'read') {
      setMode('list');
      return;
    }
    navigation.replace('Menu');
  };

  const handleShare = async () => {
    if (!selectedStory) {
      return;
    }

    try {
      await Share.share({
        message: `${selectedStory.title}\n\n${selectedStory.fullText}`,
      });
    } catch (error) {}
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
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
            </Pressable>

            <Text style={[styles.headerTitle, isVerySmall && styles.headerTitleSmall]}>
              STORIES
            </Text>
          </Animated.View>

          {mode === 'list' && (
            <ScrollView
              style={styles.flexFull}
              contentContainerStyle={[
                styles.listContent,
                {
                  paddingBottom: Math.max(insets.bottom, 20) + 14,
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={{
                  width: panelWidth,
                  opacity: listOpacity,
                  transform: [{ translateY: listTranslateY }, { scale: listScale }],
                }}
              >
                {STORIES.map((story, index) => (
                  <View
                    key={story.id}
                    style={[
                      styles.storyCard,
                      {
                        minHeight: isTiny ? 154 : isVerySmall ? 162 : 170,
                        marginTop: index === 0 ? 0 : isTiny ? 10 : 12,
                        paddingHorizontal: isTiny ? 12 : 14,
                        paddingVertical: isTiny ? 12 : 14,
                      },
                    ]}
                  >
                    <View style={styles.cardLeft}>
                      <Text
                        style={[
                          styles.cardTitle,
                          isTiny && styles.cardTitleTiny,
                          isVerySmall && !isTiny && styles.cardTitleSmall,
                        ]}
                      >
                        {story.title}
                      </Text>

                      <Text
                        style={[
                          styles.cardPreview,
                          isTiny && styles.cardPreviewTiny,
                          isVerySmall && !isTiny && styles.cardPreviewSmall,
                        ]}
                        numberOfLines={3}
                      >
                        {story.preview}
                      </Text>

                      <Pressable
                        style={[
                          styles.readButton,
                          {
                            width: isTiny ? 92 : 100,
                            height: isTiny ? 42 : 46,
                            marginTop: isTiny ? 10 : 12,
                          },
                        ]}
                        onPress={() => openStory(story)}
                      >
                        <Text
                          style={[
                            styles.readButtonText,
                            isTiny && styles.readButtonTextTiny,
                          ]}
                        >
                          READ
                        </Text>
                      </Pressable>
                    </View>

                    <Image
                      source={story.image}
                      style={{
                        width: cardImageWidth,
                        height: cardImageHeight,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </Animated.View>
            </ScrollView>
          )}

          {mode === 'read' && selectedStory && (
            <ScrollView
              style={styles.flexFull}
              contentContainerStyle={[
                styles.readContent,
                {
                  paddingBottom: Math.max(insets.bottom, 20) + 16,
                },
              ]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Animated.View
                style={[
                  styles.readCard,
                  {
                    width: panelWidth,
                    marginTop: isTiny ? 18 : isVerySmall ? 22 : 26,
                    opacity: readOpacity,
                    transform: [{ translateY: readTranslateY }, { scale: readScale }],
                    paddingTop: isTiny ? 16 : 18,
                    paddingHorizontal: isTiny ? 14 : 16,
                    paddingBottom: isTiny ? 18 : 20,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.readTitle,
                    isTiny && styles.readTitleTiny,
                    isVerySmall && !isTiny && styles.readTitleSmall,
                  ]}
                >
                  {selectedStory.title}
                </Text>

                <View style={styles.readTextBlock}>
                  <Text
                    style={[
                      styles.readText,
                      {
                        fontSize: detailTextSize,
                        lineHeight: detailLineHeight,
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {selectedStory.fullText}
                  </Text>
                </View>

                <Pressable
                  style={[
                    styles.shareButton,
                    {
                      width: isTiny ? 96 : 104,
                      height: isTiny ? 44 : 50,
                      marginTop: isTiny ? 18 : 22,
                    },
                  ]}
                  onPress={handleShare}
                >
                  <Text
                    style={[
                      styles.shareButtonText,
                      isTiny && styles.shareButtonTextTiny,
                    ]}
                  >
                    SHARE
                  </Text>
                </Pressable>

                <Image
                  source={selectedStory.image}
                  style={{
                    width: detailImageWidth,
                    height: detailImageHeight,
                    marginTop: isTiny ? 12 : 16,
                    alignSelf: 'flex-end',
                  }}
                  resizeMode="contain"
                />
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

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  headerTitleSmall: {
    fontSize: 16,
  },

  listContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 18,
  },

  storyCard: {
    width: '100%',
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },

  cardTitle: {
    color: '#111111',
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900',
  },

  cardTitleSmall: {
    fontSize: 15,
    lineHeight: 20,
  },

  cardTitleTiny: {
    fontSize: 14,
    lineHeight: 18,
  },

  cardPreview: {
    color: '#111111',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },

  cardPreviewSmall: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },

  cardPreviewTiny: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },

  readButton: {
    backgroundColor: '#1FE61A',
    borderWidth: 2,
    borderColor: '#11680D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  readButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  readButtonTextTiny: {
    fontSize: 14,
  },

  readContent: {
    width: '100%',
    alignItems: 'center',
  },

  readCard: {
    backgroundColor: '#E9C166',
    borderWidth: 2,
    borderColor: '#8C4B00',
    alignItems: 'center',
  },

  readTitle: {
    color: '#111111',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 14,
    textAlign: 'center',
    width: '100%',
  },

  readTitleSmall: {
    fontSize: 16,
    lineHeight: 21,
    marginBottom: 12,
  },

  readTitleTiny: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },

  readTextBlock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  readText: {
    color: '#111111',
    fontWeight: '500',
    width: '100%',
  },

  shareButton: {
    backgroundColor: '#1FE61A',
    borderWidth: 2,
    borderColor: '#11680D',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
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