export type TabId = 'about' | 'whyhush' | 'included';

export interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
}

export const TABS: TabConfig[] = [
  { id: 'about',    label: 'About',           icon: 'information-circle-outline' },
  { id: 'whyhush',  label: 'Why Hush',        icon: 'leaf-outline' },
  { id: 'included', label: "What's Included", icon: 'grid-outline' },
];
