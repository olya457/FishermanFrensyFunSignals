import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

const BG = require('../assets/loader_bg.png');

export default function LoadingScreen({ navigation }: Props) {
  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (!isMounted) {
        return;
      }

      navigation.replace('Onboarding');
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  const html = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: transparent;
              overflow: hidden;
            }

            body {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .star-wrap {
              width: 170px;
              height: 170px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .star {
              width: 120px;
              height: 120px;
              background: #f6eef5;
              clip-path: polygon(
                50% 0%,
                58% 14%,
                72% 6%,
                70% 22%,
                86% 18%,
                78% 32%,
                96% 36%,
                82% 46%,
                94% 58%,
                76% 58%,
                80% 76%,
                64% 68%,
                58% 88%,
                50% 74%,
                42% 88%,
                36% 68%,
                20% 76%,
                24% 58%,
                6% 58%,
                18% 46%,
                4% 36%,
                22% 32%,
                14% 18%,
                30% 22%,
                28% 6%,
                42% 14%
              );
              filter:
                drop-shadow(0 0 4px rgba(255,255,255,0.95))
                drop-shadow(0 0 10px rgba(255,255,255,0.85))
                drop-shadow(0 0 18px rgba(255,255,255,0.55));
              animation: spin 5s linear infinite;
            }

            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          </style>
        </head>
        <body>
          <div class="star-wrap">
            <div class="star"></div>
          </div>
        </body>
      </html>
    `,
    [],
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          overScrollMode="never"
          javaScriptEnabled
          domStorageEnabled
          androidLayerType="hardware"
          backgroundColor="transparent"
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  webview: {
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
  },
});