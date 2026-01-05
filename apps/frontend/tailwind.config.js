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
        /* shadcn/ui color system */
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

        /* Corporate theme colors */
        corp: {
          bg: {
            DEFAULT: 'var(--corp-bg-primary)',
            secondary: 'var(--corp-bg-secondary)',
            tertiary: 'var(--corp-bg-tertiary)',
            hover: 'var(--corp-bg-hover)',
          },
          primary: {
            DEFAULT: 'var(--corp-primary)',
            hover: 'var(--corp-primary-hover)',
            light: 'var(--corp-primary-light)',
          },
          secondary: {
            DEFAULT: 'var(--corp-secondary)',
            hover: 'var(--corp-secondary-hover)',
          },
          accent: {
            DEFAULT: 'var(--corp-accent)',
            light: 'var(--corp-accent-light)',
          },
          success: {
            DEFAULT: 'var(--corp-success)',
            light: 'var(--corp-success-light)',
          },
          warning: {
            DEFAULT: 'var(--corp-warning)',
            light: 'var(--corp-warning-light)',
          },
          danger: {
            DEFAULT: 'var(--corp-danger)',
            light: 'var(--corp-danger-light)',
          },
          info: {
            DEFAULT: 'var(--corp-info)',
            light: 'var(--corp-info-light)',
          },
          text: {
            primary: 'var(--corp-text-primary)',
            secondary: 'var(--corp-text-secondary)',
            tertiary: 'var(--corp-text-tertiary)',
            muted: 'var(--corp-text-muted)',
            disabled: 'var(--corp-text-disabled)',
          },
          border: {
            light: 'var(--corp-border-light)',
            medium: 'var(--corp-border-medium)',
            dark: 'var(--corp-border-dark)',
          },
        },

        /* Neumorphic theme colors - LEGACY (for backward compatibility during migration) */
        neu: {
          bg: '#e8eef5',
          primary: '#2064d8',
          secondary: '#21d8aa',
          text: {
            primary: '#2e3b52',
            muted: '#98afc2',
          },
          shadow: {
            light: '#ffffff',
            dark: '#c4c9cf',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        /* Corporate shadows - clean and minimal */
        'corp-sm': 'var(--corp-shadow-sm)',
        'corp-md': 'var(--corp-shadow-md)',
        'corp-lg': 'var(--corp-shadow-lg)',
        'corp-xl': 'var(--corp-shadow-xl)',

        /* Neumorphic shadows - LEGACY (for backward compatibility during migration) */
        // Soft/Raised shadows (element pops out) - Light mode
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
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
