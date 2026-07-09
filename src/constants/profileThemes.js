export const PROFILE_THEME_FALLBACK_ID = 'darkBlue';

export const PROFILE_THEMES = [
  {
    id: 'darkBlue',
    name: 'Koyu Mavi',
    description: 'Sportif, premium ve koyu mavi profil görünümü.',
    primary: '#2563EB',
    secondary: '#071833',
    accent: '#38BDF8',
    textColor: '#FFFFFF',
    mutedTextColor: '#C7D2FE',
    backgroundColors: ['#020617', '#08245A', '#0B4BD8'],
    previewColors: ['#031A42', '#0B4BD8', '#38BDF8'],
    patternType: 'geometry',
  },
  {
    id: 'royalPurple',
    name: 'Asil Mor',
    description: 'Royal violet, dark plum ve yumuşak dalga hissi.',
    primary: '#7C3AED',
    secondary: '#2E1065',
    accent: '#D946EF',
    textColor: '#FFFFFF',
    mutedTextColor: '#E9D5FF',
    backgroundColors: ['#1E063F', '#4C1D95', '#9333EA'],
    previewColors: ['#2E1065', '#7C3AED', '#D946EF'],
    patternType: 'waves',
  },
  {
    id: 'pearlPink',
    name: 'İnci Pembe',
    description: 'Blush pink, pearl ve soft cream geçişleri.',
    primary: '#F472B6',
    secondary: '#FFF1F2',
    accent: '#FDBA74',
    textColor: '#3B1726',
    mutedTextColor: '#7F5262',
    backgroundColors: ['#FFF7ED', '#FBCFE8', '#FDA4AF'],
    previewColors: ['#FFF7ED', '#FBCFE8', '#FDA4AF'],
    patternType: 'softWave',
  },
  {
    id: 'classic',
    name: 'Klasik',
    description: 'Mevcut açık mavi ve pembe profil havası.',
    primary: '#2563EB',
    secondary: '#DBEAFE',
    accent: '#F3D8FF',
    textColor: '#0B1C30',
    mutedTextColor: '#475569',
    backgroundColors: ['#EEF5FF', '#DBEAFE', '#F3D8FF'],
    previewColors: ['#EEF5FF', '#DBEAFE', '#F3D8FF'],
    patternType: 'classic',
  },
];

export function getProfileTheme(themeId) {
  return (
    PROFILE_THEMES.find(theme => theme.id === themeId) ||
    PROFILE_THEMES.find(theme => theme.id === PROFILE_THEME_FALLBACK_ID) ||
    PROFILE_THEMES[0]
  );
}
