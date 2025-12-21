/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Neumorphic color palette (Updated to match sidebar theme)
        neu: {
          bg: '#e8eef5',
          'bg-alt': '#e0e5ec',
          'bg-dark': '#2b2d33',
          'bg-dark-alt': '#31343b',
          border: '#d1d9e6',
          'border-dark': '#3d4049',
          'shadow-dark': '#c4c9cf',
          'shadow-light': '#ffffff',
          'shadow-dark-dm': '#1e1f23',
          'shadow-light-dm': '#383b43',
          // Brand colors
          primary: '#1e6eff',
          'primary-dark': '#0052cc',
          secondary: '#00c896',
          warning: '#f59e0b',
          danger: '#ff4d6a',
        },
        // Text colors
        'neu-text': {
          primary: '#1e3a5f',
          secondary: '#3d5a80',
          muted: '#98afc2',
          // Legacy aliases
          dark: '#1e3a5f',
          light: '#98afc2',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Neumorphic border radius
        'neu-xs': '0.25rem',
        'neu-sm': '0.5rem',
        neu: '0.75rem',
        'neu-md': '1rem',
        'neu-lg': '1.25rem',
        'neu-xl': '1.5rem',
        'neu-2xl': '2rem',
      },
      boxShadow: {
        // Soft/Raised shadows (element pops out) - Light mode
        // Uses #c4c9cf for dark shadow, #ffffff for light shadow
        'neu-flat': '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
        'neu-raised-xs': '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
        'neu-raised-sm': '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        'neu-raised': '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
        'neu-raised-md': '8px 8px 16px #c4c9cf, -8px -8px 16px #ffffff',
        'neu-raised-lg': '10px 10px 20px #c4c9cf, -10px -10px 20px #ffffff',
        'neu-raised-xl': '15px 15px 30px #c4c9cf, -15px -15px 30px #ffffff',
        // Inset/Pressed shadows (element pushed in) - Light mode
        'neu-pressed-xs': 'inset 1px 1px 2px #c4c9cf, inset -1px -1px 2px #ffffff',
        'neu-pressed-sm': 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
        'neu-pressed': 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
        'neu-pressed-md': 'inset 4px 4px 8px #c4c9cf, inset -4px -4px 8px #ffffff',
        'neu-pressed-lg': 'inset 6px 6px 12px #c4c9cf, inset -6px -6px 12px #ffffff',
        // Dark mode shadows
        'neu-raised-dark': '6px 6px 12px #1e1f23, -6px -6px 12px #383b43',
        'neu-raised-sm-dark': '3px 3px 6px #1e1f23, -3px -3px 6px #383b43',
        'neu-pressed-dark': 'inset 3px 3px 6px #1e1f23, inset -3px -3px 6px #383b43',
        'neu-pressed-sm-dark': 'inset 2px 2px 4px #1e1f23, inset -2px -2px 4px #383b43',
        // Legacy aliases for compatibility
        'neu-out': '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
        'neu-in': 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
        'neu-out-dark': '6px 6px 12px #1e1f23, -6px -6px 12px #383b43',
        'neu-in-dark': 'inset 3px 3px 6px #1e1f23, inset -3px -3px 6px #383b43',
        // Button specific
        'neu-btn': '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
        'neu-btn-hover': '5px 5px 10px #c4c9cf, -5px -5px 10px #ffffff',
        'neu-btn-active': 'inset 2px 2px 5px #c4c9cf, inset -2px -2px 5px #ffffff',
        // Input specific
        'neu-input': 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
        'neu-input-focus': 'inset 3px 3px 6px #c4c9cf, inset -3px -3px 6px #ffffff',
      },
      // Transitions for neumorphic interactions
      transitionDuration: {
        neu: '200ms',
      },
      transitionTimingFunction: {
        neu: 'ease',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
