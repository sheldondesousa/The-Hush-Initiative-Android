import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export type MenuSection = 'profile' | 'dashboard' | 'configuration' | 'about' | 'terms';
export type MenuThemeMode = 'light' | 'dark' | 'minimal';

type MenuPalette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  tint: string;
  border: string;
};

type MenuIconProps = { color: string };

const MENU_ICON_SIZE = 24;

function ProfileIcon({ color }: MenuIconProps) {
  return (
    <Svg width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Circle cx={12} cy={8} r={3.2} stroke={color} strokeWidth={1.8} />
      <Path d="M4.5 20c0-4 3.5-6.5 7.5-6.5s7.5 2.5 7.5 6.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function DashboardIcon({ color }: MenuIconProps) {
  return (
    <Svg width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="M4 17 L9 11 L13 14 L19 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={4} cy={17} r={1.3} fill={color} />
      <Circle cx={9} cy={11} r={1.3} fill={color} />
      <Circle cx={13} cy={14} r={1.3} fill={color} />
      <Circle cx={19} cy={5} r={1.3} fill={color} />
    </Svg>
  );
}

function ConfigurationIcon({ color }: MenuIconProps) {
  return (
    <Svg width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AboutIcon({ color }: MenuIconProps) {
  return (
    <Svg width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8} />
      <Line x1={12} y1={11} x2={12} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={7.5} r={1} fill={color} stroke={color} />
    </Svg>
  );
}

function TermsIcon({ color }: MenuIconProps) {
  return (
    <Svg width={MENU_ICON_SIZE} height={MENU_ICON_SIZE} viewBox="0 0 24 24" fill="none" accessible={false}>
      <Path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M15 3v4h4" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Line x1={8} y1={12} x2={16} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={8} y1={16} x2={16} y2={16} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

const MENU_ICONS: Record<MenuSection, React.ComponentType<MenuIconProps>> = {
  profile: ProfileIcon,
  dashboard: DashboardIcon,
  configuration: ConfigurationIcon,
  about: AboutIcon,
  terms: TermsIcon,
};

const MENU_ITEMS: Array<{ id: MenuSection; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'about', label: 'About Hush' },
  { id: 'terms', label: 'Terms & Conditions' },
];

const ABOUT_SECTIONS = [
  {
    title: 'It Started With Silence.',
    body: "There’s a particular kind of exhaustion that comes from being always on. The notifications, deadlines, endless scroll, and the noise that follows you even when you try to sleep. Hush began with the need for one quiet moment—something simple to turn to, on your terms and in your time.",
  },
  {
    title: 'What We Couldn’t Find',
    body: 'Too many wellbeing apps felt visually overwhelming, crowded with upsells, or designed to keep people engaged. We wanted the opposite: a clear, honest space grounded in evidence, without pressure, clutter, or a subscription gate.',
  },
  {
    title: 'The “Aha” Moment',
    body: 'Breathing and sound offered what we had been looking for: intentional, evidence-informed exercises that help the mind and body settle naturally. No achievement badges or streaks—just a useful practice when you need it.',
  },
  {
    title: 'This Is For You If…',
    body: 'You are tired of external chaos and internal chatter. You value simplicity over complexity and evidence over trends. You do not need millions of features; you need one thing that works.',
  },
  {
    title: 'A Small Collective',
    body: 'Hush is built for people who understand that sometimes the most restorative thing you can do is simply rest your mind. Use it when you need it, share it if you want to, and let it remain quieter than a revolution—a breath.',
  },
];

const TERMS_SECTIONS: Array<{ title: string; body: string; bullets?: string[] }> = [
  {
    title: '1. Who We Are',
    body: 'Hush is developed by a small team offering a minimalist breathing and mindfulness tool. We do not serve ads, offer upsells, or sell your data.',
  },
  {
    title: '2. Use of the App',
    body: 'You may use the app for personal, non-commercial purposes only. You must not:',
    bullets: [
      'Use the app for unlawful or harmful purposes.',
      'Attempt to reverse-engineer, copy, or distribute the app or its content.',
      'Use automated systems to access the app or collect data.',
    ],
  },
  {
    title: '3. Health Disclaimer',
    body: 'Hush provides general breathing and mindfulness exercises for relaxation and focus. It is not a substitute for professional medical advice or treatment.',
    bullets: [
      'Use the exercises at your own risk.',
      'Consult your doctor before use if you have respiratory, cardiac, or neurological conditions.',
      'Stop any practice that causes discomfort.',
    ],
  },
  {
    title: '4. Intellectual Property',
    body: 'All app content—including visuals, sound design, and breathing patterns—is owned by the app creators or used with permission. You may not reproduce, distribute, or modify it without explicit written consent.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'The app is provided “as is” without warranties of any kind. To the fullest extent permitted by law, we disclaim liability for direct or indirect damages, health-related outcomes, service interruptions, or data loss.',
  },
  {
    title: '6. Privacy',
    body: 'Your use of Hush is also subject to its privacy practices. Saved exercise defaults are stored locally on your device.',
  },
  {
    title: '7. Governing Law',
    body: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.',
  },
];

export function MenuHome({ palette, onSelect }: { palette: MenuPalette; onSelect: (section: MenuSection) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.pageHeader}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>NAVIGATE</Text>
        <Text style={[styles.pageTitle, { color: palette.text }]}>Menu</Text>
      </View>
      {MENU_ITEMS.map((item) => {
        const Icon = MENU_ICONS[item.id];
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            style={[styles.menuTile, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <View style={styles.menuTileLeft}>
              <Icon color={palette.text} />
              <Text style={[styles.menuLabel, { color: palette.text }]}>{item.label}</Text>
            </View>
            <Text style={[styles.menuChevron, { color: palette.muted }]}>›</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function PageHeader({
  eyebrow,
  title,
  palette,
  onBack,
}: {
  eyebrow: string;
  title: string;
  palette: MenuPalette;
  onBack: () => void;
}) {
  return (
    <View style={styles.pageHeader}>
      <Pressable
        onPress={onBack}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Back to menu"
        style={styles.backRow}
      >
        <Text style={[styles.backText, { color: palette.text }]}>‹ Menu</Text>
      </Pressable>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>{eyebrow}</Text>
      <Text style={[styles.pageTitle, { color: palette.text }]}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value, palette, last = false }: { label: string; value: string; palette: MenuPalette; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.infoLabel, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

function ProfilePage({ palette, onBack }: { palette: MenuPalette; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="YOUR SPACE" title="Profile" palette={palette} onBack={onBack} />
      <View style={styles.identityBlock}>
        <View style={[styles.avatar, { backgroundColor: palette.tint, borderColor: palette.border }]}>
          <Text style={[styles.avatarText, { color: palette.accent }]}>H</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={[styles.identityName, { color: palette.text }]}>Hush User</Text>
          <Text style={[styles.identityMeta, { color: palette.muted }]}>Local profile</Text>
        </View>
      </View>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Profile details</Text>
      <View style={[styles.infoCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
        <InfoRow label="Account" value="On this device" palette={palette} />
        <InfoRow label="Practice data" value="Private" palette={palette} last />
      </View>
      <Text style={[styles.supportingText, { color: palette.muted }]}>
        Your exercise preferences and local practice activity stay on this device.
      </Text>
    </ScrollView>
  );
}

function DashboardPage({
  palette,
  completedSessions,
  mindfulMinutes,
  onBack,
}: {
  palette: MenuPalette;
  completedSessions: number;
  mindfulMinutes: number;
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="YOUR PRACTICE" title="Dashboard" palette={palette} onBack={onBack} />
      <Text style={[styles.dashboardLead, { color: palette.text }]}>Take a deep breath and relax.</Text>
      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.metricValue, { color: palette.text }]}>{completedSessions}</Text>
          <Text style={[styles.metricLabel, { color: palette.muted }]}>Sessions complete</Text>
        </View>
        <View style={[styles.metric, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Text style={[styles.metricValue, { color: palette.text }]}>{mindfulMinutes}</Text>
          <Text style={[styles.metricLabel, { color: palette.muted }]}>Mindful minutes</Text>
        </View>
      </View>
      <View style={[styles.callout, { backgroundColor: palette.tint }]}>
        <Text style={[styles.calloutTitle, { color: palette.text }]}>Your practice overview</Text>
        <Text style={[styles.calloutBody, { color: palette.muted }]}>Activity updates whenever you complete a breathing or meditation session.</Text>
      </View>
    </ScrollView>
  );
}

function ConfigurationPage({
  palette,
  themeMode,
  setThemeMode,
  showOnboardingAfterSplash,
  setShowOnboardingAfterSplash,
  onBack,
}: {
  palette: MenuPalette;
  themeMode: MenuThemeMode;
  setThemeMode: (mode: MenuThemeMode) => void;
  showOnboardingAfterSplash: boolean;
  setShowOnboardingAfterSplash: (enabled: boolean) => void;
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="PREFERENCES" title="Configuration" palette={palette} onBack={onBack} />
      <Text style={[styles.sectionTitle, { color: palette.text }]}>Appearance</Text>
      {(['light', 'dark', 'minimal'] as MenuThemeMode[]).map((mode) => {
        const selected = themeMode === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => setThemeMode(mode)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <Text style={[styles.settingText, { color: palette.text }]}>{mode[0].toUpperCase() + mode.slice(1)}</Text>
            <View style={[styles.radioOuter, { borderColor: selected ? palette.accent : palette.border }]}>
              {selected && <View style={[styles.radioInner, { backgroundColor: palette.accent }]} />}
            </View>
          </Pressable>
        );
      })}
      <Text style={[styles.supportingText, { color: palette.muted }]}>Choose the visual mode that feels most comfortable. The change applies immediately.</Text>
      <Text style={[styles.sectionTitle, styles.configurationSectionTitle, { color: palette.text }]}>Onboarding</Text>
      <Pressable
        onPress={() => setShowOnboardingAfterSplash(!showOnboardingAfterSplash)}
        accessibilityRole="switch"
        accessibilityLabel="Show onboarding after splash"
        accessibilityState={{ checked: showOnboardingAfterSplash }}
        style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.border }]}
      >
        <Text style={[styles.settingText, { color: palette.text }]}>Show after splash</Text>
        <View
          style={[
            styles.switchTrack,
            {
              backgroundColor: showOnboardingAfterSplash ? palette.accent : palette.border,
              alignItems: showOnboardingAfterSplash ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <View style={[styles.switchThumb, { backgroundColor: palette.surface }]} />
        </View>
      </Pressable>
      <Text style={[styles.supportingText, { color: palette.muted }]}>
        When enabled, the three onboarding screens appear after the splash screen on every app launch.
      </Text>
    </ScrollView>
  );
}

function AboutPage({ palette, onBack }: { palette: MenuPalette; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="OUR STORY" title="About Hush" palette={palette} onBack={onBack} />
      {ABOUT_SECTIONS.map((section, index) => (
        <View key={section.title} style={[styles.copySection, index > 0 && { borderTopColor: palette.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <Text style={[styles.copyTitle, { color: palette.text }]}>{section.title}</Text>
          <Text style={[styles.copyBody, { color: palette.muted }]}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function TermsPage({ palette, onBack }: { palette: MenuPalette; onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <PageHeader eyebrow="LEGAL" title="Terms & Conditions" palette={palette} onBack={onBack} />
      <Text style={[styles.updatedText, { color: palette.muted }]}>Last updated: January 9, 2026</Text>
      <Text style={[styles.termsIntro, { color: palette.muted }]}>Please read these Terms and Conditions carefully before using Hush. By accessing or using the app, you agree to be bound by these Terms.</Text>
      {TERMS_SECTIONS.map((section) => (
        <View key={section.title} style={[styles.copySection, { borderTopColor: palette.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <Text style={[styles.copyTitle, { color: palette.text }]}>{section.title}</Text>
          <Text style={[styles.copyBody, { color: palette.muted }]}>{section.body}</Text>
          {section.bullets?.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: palette.accent }]}>•</Text>
              <Text style={[styles.bulletText, { color: palette.muted }]}>{bullet}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

export function MenuSectionScreen({
  section,
  palette,
  completedSessions,
  mindfulMinutes,
  themeMode,
  setThemeMode,
  showOnboardingAfterSplash,
  setShowOnboardingAfterSplash,
  onSelectSection,
  onBack,
}: {
  section: MenuSection | null;
  palette: MenuPalette;
  completedSessions: number;
  mindfulMinutes: number;
  themeMode: MenuThemeMode;
  setThemeMode: (mode: MenuThemeMode) => void;
  showOnboardingAfterSplash: boolean;
  setShowOnboardingAfterSplash: (enabled: boolean) => void;
  onSelectSection: (section: MenuSection) => void;
  onBack: () => void;
}) {
  if (section === null) return <MenuHome palette={palette} onSelect={onSelectSection} />;
  if (section === 'profile') return <ProfilePage palette={palette} onBack={onBack} />;
  if (section === 'dashboard') {
    return (
      <DashboardPage
        palette={palette}
        completedSessions={completedSessions}
        mindfulMinutes={mindfulMinutes}
        onBack={onBack}
      />
    );
  }
  if (section === 'configuration') {
    return (
      <ConfigurationPage
        palette={palette}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        showOnboardingAfterSplash={showOnboardingAfterSplash}
        setShowOnboardingAfterSplash={setShowOnboardingAfterSplash}
        onBack={onBack}
      />
    );
  }
  if (section === 'about') return <AboutPage palette={palette} onBack={onBack} />;
  return <TermsPage palette={palette} onBack={onBack} />;
}

const styles = StyleSheet.create({
  eyebrow: { fontSize: 11, lineHeight: 17, fontWeight: '700', letterSpacing: 1.7 },
  menuTile: {
    minHeight: 58, borderWidth: 1, borderRadius: 14, marginBottom: 9, paddingHorizontal: 17,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  menuTileLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuLabel: { fontSize: 16, lineHeight: 22 },
  menuChevron: { fontSize: 27, lineHeight: 30, fontWeight: '300' },
  pageContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 48 },
  pageHeader: { marginBottom: 28 },
  backRow: { marginBottom: 14 },
  backText: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  pageTitle: { marginTop: 7, fontSize: 38, lineHeight: 44, fontWeight: '500', letterSpacing: -1.2 },
  identityBlock: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 30, lineHeight: 36, fontWeight: '500' },
  identityCopy: { marginLeft: 16 },
  identityName: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  identityMeta: { marginTop: 3, fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 20, lineHeight: 26, fontWeight: '600', marginBottom: 14 },
  infoCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  infoRow: { minHeight: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  infoLabel: { fontSize: 15, lineHeight: 21 },
  infoValue: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  supportingText: { marginTop: 14, fontSize: 13, lineHeight: 20 },
  dashboardLead: { fontSize: 20, lineHeight: 29, fontWeight: '500', marginBottom: 22 },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, minHeight: 132, borderWidth: 1, borderRadius: 16, padding: 18, justifyContent: 'space-between' },
  metricValue: { fontSize: 40, lineHeight: 46, fontWeight: '500', fontVariant: ['tabular-nums'] },
  metricLabel: { fontSize: 13, lineHeight: 18 },
  callout: { marginTop: 24, borderRadius: 16, padding: 20 },
  calloutTitle: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  calloutBody: { marginTop: 7, fontSize: 14, lineHeight: 21 },
  settingRow: { minHeight: 58, borderWidth: 1, borderRadius: 14, marginBottom: 9, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingText: { fontSize: 16, lineHeight: 22 },
  configurationSectionTitle: { marginTop: 30 },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  updatedText: { marginTop: -14, marginBottom: 18, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  termsIntro: { fontSize: 15, lineHeight: 24, marginBottom: 8 },
  copySection: { paddingTop: 24, marginTop: 24 },
  copyTitle: { fontSize: 19, lineHeight: 25, fontWeight: '600', marginBottom: 10 },
  copyBody: { fontSize: 15, lineHeight: 24 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  bullet: { width: 18, fontSize: 17, lineHeight: 23 },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 23 },
});
