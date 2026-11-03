// Configuration Tailwind (version CDN) — palette A « Ardoise & bleu »
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#F7F8FA',
        card: '#FFFFFF',
        ink: '#16181D',
        muted: '#5B6270',
        line: '#E2E5EA',
        accent: { DEFAULT: '#2F5BEA', hover: '#2449C4', night: '#7C9CFF' },
        night: { DEFAULT: '#0F1115', card: '#181B21', line: '#262A33', ink: '#E8EAED', muted: '#9AA1AD' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1120px' },
    },
  },
};
