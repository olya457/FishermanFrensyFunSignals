import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MoodScreen from '../screens/MoodScreen';
import MenuScreen from '../screens/MenuScreen';

import AskRiverScreen from '../screens/AskRiverScreen';
import NicknameScreen from '../screens/NicknameScreen';
import StoriesScreen from '../screens/StoriesScreen';
import DailyQuizScreen from '../screens/DailyQuizScreen';
import WormJarScreen from '../screens/WormJarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Mood" component={MoodScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="AskRiver" component={AskRiverScreen} />
      <Stack.Screen name="Nickname" component={NicknameScreen} />
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="DailyQuiz" component={DailyQuizScreen} />
      <Stack.Screen name="WormJar" component={WormJarScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}