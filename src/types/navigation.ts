export type TabId = 'about' | 'whyhush' | 'included';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: keyof typeof import('@expo/vector-icons/build/Ionicons').glyphMap;
}

export const TABS: TabConfig[] = [
  { id: 'about',    label: 'About',           icon: 'information-circle-outline' },
  { id: 'whyhush',  label: 'Why Hush',        icon: 'leaf-outline' },
  { id: 'included', label: "What's Included", icon: 'grid-outline' },
];
