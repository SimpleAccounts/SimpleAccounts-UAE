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
