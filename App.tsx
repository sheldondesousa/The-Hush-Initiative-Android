import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ExplorePanel } from './src/navigation/ExplorePanel';
import { AboutScreen } from './src/screens/AboutScreen';
import { WhyHushScreen } from './src/screens/WhyHushScreen';
import { IncludedScreen } from './src/screens/IncludedScreen';
import { Colors } from './src/theme/colors';
import { TabId } from './src/types/navigation';

const SIDEBAR_BREAKPOINT = 768;

export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}

function Main() {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  const renderScreen = () => {
    switch (activeTab) {
      case 'about':    return <AboutScreen />;
      case 'whyhush':  return <WhyHushScreen />;
      case 'included': return <IncludedScreen />;
    }
  };

  if (isWide) {
    return (
      <View
        style={[
          styles.wideRoot,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <StatusBar style="dark" />
        <View style={styles.wideLayout}>
          <ExplorePanel
            activeTab={activeTab}
            onTabPress={setActiveTab}
            mode="sidebar"
          />
          <View style={styles.wideContent}>
            {renderScreen()}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.narrowRoot} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.narrowLayout}>
        <View style={styles.narrowContent}>
          {renderScreen()}
        </View>
        <View style={{ paddingBottom: insets.bottom }}>
          <ExplorePanel
            activeTab={activeTab}
            onTabPress={setActiveTab}
            mode="tabs"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wideRoot: {
    flex: 1,
    backgroundColor: Colors.contentBg,
  },
  wideLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  wideContent: {
    flex: 1,
  },
  narrowRoot: {
    flex: 1,
    backgroundColor: Colors.contentBg,
  },
  narrowLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  narrowContent: {
    flex: 1,
  },
});
