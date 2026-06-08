import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { TABS, TabId, TabConfig } from '../types/navigation';

interface ExplorePanelProps {
  activeTab: TabId;
  onTabPress: (id: TabId) => void;
  mode: 'sidebar' | 'tabs';
}

export function ExplorePanel({ activeTab, onTabPress, mode }: ExplorePanelProps) {
  if (mode === 'sidebar') {
    return <SidebarPanel activeTab={activeTab} onTabPress={onTabPress} />;
  }
  return <BottomTabsPanel activeTab={activeTab} onTabPress={onTabPress} />;
}

function SidebarPanel({ activeTab, onTabPress }: Omit<ExplorePanelProps, 'mode'>) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarHeading}>Explore</Text>
      <View style={styles.sidebarDivider} />
      {TABS.map((tab) => (
        <SidebarItem
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onPress={() => onTabPress(tab.id)}
        />
      ))}
    </View>
  );
}

function SidebarItem({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && <View style={styles.sidebarActiveBar} />}
      <Ionicons
        name={tab.icon}
        size={18}
        color={isActive ? Colors.panelActive : Colors.panelInactive}
        style={styles.sidebarIcon}
      />
      <Text style={[styles.sidebarLabel, isActive && styles.sidebarLabelActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

function BottomTabsPanel({ activeTab, onTabPress }: Omit<ExplorePanelProps, 'mode'>) {
  return (
    <View style={styles.bottomBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bottomTabsContent}
      >
        {TABS.map((tab) => (
          <BottomTab
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function BottomTab({
  tab,
  isActive,
  onPress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.bottomTab}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={tab.icon}
        size={20}
        color={isActive ? Colors.panelActive : Colors.panelInactive}
      />
      <Text style={[styles.bottomTabLabel, isActive && styles.bottomTabLabelActive]}>
        {tab.label}
      </Text>
      {isActive && <View style={styles.bottomActiveIndicator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Sidebar ─────────────────────────────────────────────────────────────
  sidebar: {
    width: 192,
    backgroundColor: Colors.panelBg,
    borderRadius: 16,
    margin: 12,
    marginRight: 0,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
    }),
  },
  sidebarHeading: {
    color: Colors.panelHeading,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: Colors.panelBorder,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 12,
    marginVertical: 2,
    borderRadius: 10,
    marginHorizontal: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  sidebarItemActive: {
    backgroundColor: 'rgba(139,124,246,0.12)',
  },
  sidebarActiveBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: Colors.panelActive,
    borderRadius: 2,
  },
  sidebarIcon: {
    marginRight: 10,
  },
  sidebarLabel: {
    color: Colors.panelInactive,
    fontSize: 14,
    fontWeight: '500',
  },
  sidebarLabelActive: {
    color: Colors.panelText,
    fontWeight: '600',
  },

  // ── Bottom tabs ──────────────────────────────────────────────────────────
  bottomBar: {
    backgroundColor: Colors.panelBg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
    }),
  },
  bottomTabsContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bottomTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    minWidth: 96,
    position: 'relative',
  },
  bottomTabLabel: {
    color: Colors.panelInactive,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },
  bottomTabLabelActive: {
    color: Colors.panelActive,
    fontWeight: '600',
  },
  bottomActiveIndicator: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 2,
    backgroundColor: Colors.panelActive,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
});
