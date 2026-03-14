import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        The Hush Initiative
      </Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        Your journey begins here.
      </Text>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  containerDark: {
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  titleDark: {
    color: '#f7fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#a0aec0',
  },
});
