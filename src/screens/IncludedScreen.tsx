import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const FEATURES = [
  {
    icon: 'headset-outline' as const,
    label: 'Guided Audio Sessions',
    detail: 'Curated silence, ambient soundscapes, and voice-guided breathwork.',
  },
  {
    icon: 'timer-outline' as const,
    label: 'Breathe Timer',
    detail: 'Customisable breathing patterns — 4-7-8, box breathing, and more.',
  },
  {
    icon: 'journal-outline' as const,
    label: 'Reflection Journal',
    detail: 'A private, prompt-led journal for quiet introspection.',
  },
  {
    icon: 'notifications-off-outline' as const,
    label: 'Focus Mode',
    detail: 'One-tap quiet hours that silence interruptions across the device.',
  },
  {
    icon: 'bar-chart-outline' as const,
    label: 'Stillness Insights',
    detail: 'Gentle weekly summaries of your quiet practice — no streaks, no scores.',
  },
  {
    icon: 'color-palette-outline' as const,
    label: 'Calm Themes',
    detail: 'Hand-crafted visual themes designed to reduce visual noise.',
  },
];

export function IncludedScreen() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>The Hush Initiative</Text>
      <Text style={styles.heading}>What's Included</Text>
      <View style={styles.divider} />

      <Text style={styles.lead}>
        Everything in The Hush Initiative is designed to remove friction, not
        add it. Here is what you will find inside.
      </Text>

      <View style={styles.list}>
        {FEATURES.map((f) => (
          <FeatureRow key={f.label} icon={f.icon} label={f.label} detail={f.detail} />
        ))}
      </View>

      <View style={styles.note}>
        <Ionicons name="sparkles-outline" size={16} color={Colors.accent} style={{ marginBottom: 8 }} />
        <Text style={styles.noteText}>
          All features are available without a subscription. The Hush Initiative
          will never put silence behind a paywall.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureRow({
  icon,
  label,
  detail,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={Colors.accent} />
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
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
  list: {
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  rowLeft: {
    marginRight: 16,
    paddingTop: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(139,124,246,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: {
    flex: 1,
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.contentText,
    marginBottom: 2,
  },
  rowDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.contentSub,
  },
  note: {
    backgroundColor: 'rgba(139,124,246,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,124,246,0.20)',
    padding: 20,
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.contentText,
  },
});
