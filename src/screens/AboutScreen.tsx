import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export function AboutScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>The Hush Initiative</Text>
      <Text style={styles.heading}>About</Text>
      <View style={styles.divider} />

      <Text style={styles.lead}>
        The Hush Initiative is a mindful space designed to help you slow down,
        breathe, and reconnect with stillness in an always-on world.
      </Text>

      <Section title="Our Mission">
        We believe that silence is not emptiness — it is the foundation of
        clarity. The Hush Initiative was created to give people a dedicated
        sanctuary from noise, offering guided practices, reflective tools, and
        a gentle reminder to pause.
      </Section>

      <Section title="Who We Are">
        Founded by a team of mindfulness practitioners and wellness designers,
        The Hush Initiative brings together research-backed techniques with an
        experience that is calm to look at, calm to use, and calm to return to.
      </Section>

      <Section title="Our Approach">
        Every feature is designed around one principle: less is more. We do not
        gamify, we do not notify unnecessarily, and we do not compete for your
        attention. We simply hold space for you.
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.contentBg,
  },
  container: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.accent,
    marginBottom: 6,
  },
  heading: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.contentText,
    letterSpacing: -0.5,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 24,
  },
  lead: {
    fontSize: 17,
    lineHeight: 26,
    color: Colors.contentText,
    fontWeight: '400',
    marginBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.contentSub,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.contentText,
  },
});
