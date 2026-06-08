import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const REASONS = [
  {
    icon: 'phone-portrait-outline' as const,
    title: 'Digital Overload',
    body: 'The average person receives over 80 notifications a day. Constant interruption fractures focus and elevates stress hormones. Hush creates a counter-space.',
  },
  {
    icon: 'pulse-outline' as const,
    title: 'Chronic Stress',
    body: 'Prolonged exposure to noise — digital and physical — keeps the nervous system in a low-level fight-or-flight state. Silence is a biological reset.',
  },
  {
    icon: 'moon-outline' as const,
    title: 'Sleep Disruption',
    body: 'Screen stimulation before bed delays melatonin production. Quiet rituals at night measurably improve sleep onset and quality.',
  },
  {
    icon: 'flower-outline' as const,
    title: 'Lost Presence',
    body: 'When the mind is always elsewhere — planning, scrolling, replying — life passes at half-perception. Hush practices bring you back to now.',
  },
];

export function WhyHushScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>The Hush Initiative</Text>
      <Text style={styles.heading}>Why Hush</Text>
      <View style={styles.divider} />

      <Text style={styles.lead}>
        Silence has become rare. Not because the world is louder — though it
        is — but because we have stopped seeking quiet. Hush is why that
        matters, and what we can do about it.
      </Text>

      <View style={styles.cards}>
        {REASONS.map((r) => (
          <ReasonCard key={r.title} icon={r.icon} title={r.title} body={r.body} />
        ))}
      </View>

      <View style={styles.callout}>
        <Text style={styles.calloutText}>
          "In the attitude of silence the soul finds the path in a clearer
          light, and what is elusive and deceptive resolves itself into crystal
          clearness."
        </Text>
        <Text style={styles.calloutAttrib}>— Mahatma Gandhi</Text>
      </View>
    </ScrollView>
  );
}

function ReasonCard({
  icon,
  title,
  body,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={22} color={Colors.accent} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardBody}>{body}</Text>
      </View>
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
    marginBottom: 32,
  },
  cards: {
    gap: 16,
    marginBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,124,246,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.contentText,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.contentSub,
  },
  callout: {
    backgroundColor: Colors.panelBg,
    borderRadius: 14,
    padding: 22,
  },
  calloutText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#C8C5E8',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  calloutAttrib: {
    fontSize: 12,
    color: Colors.panelInactive,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
