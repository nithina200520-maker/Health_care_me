/**
 * CareBridge AI Design System & Color Tokens
 */
export const THEME = {
  colors: {
    bgDeepNavy: '#07111F',
    bgSecondary: '#0B1728',
    bgCard: '#101F33',
    bgElevated: '#142842',
    accentCyan: '#00D4FF',
    accentBlue: '#3478F6',
    healthSuccess: '#22C55E',
    healthWarning: '#F59E0B',
    healthError: '#EF4444',
    textPrimary: '#F8FAFC',
    textSecondary: '#A9BCD0',
    textMuted: '#71849A',
  },
  tagline: 'Your health, connected and cared for.',
  name: 'CareBridge AI',
};

/**
 * Utility helper for conditionally combining class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
