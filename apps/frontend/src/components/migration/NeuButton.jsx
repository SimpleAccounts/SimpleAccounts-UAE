/**
 * NeuButton - Neumorphic Button Component
 * Migration wrapper: reactstrap Button API → shadcn/ui Button with neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Button):
 *   import { NeuButton as Button } from 'components/migration';
 *   <Button color="primary" onClick={handleClick}>Save</Button>
 */
import React from 'react';
import { cn } from '@/lib/utils';

// Neumorphic style constants
const NEU_STYLES = {
  base: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  hover: {
    transform: 'translateY(-2px)',
    boxShadow:
      '4px 4px 8px var(--neu-shadow-dark, #c4c9cf), -4px -4px 8px var(--neu-shadow-light, #ffffff)',
  },
  active: {
    transform: 'translateY(0)',
    boxShadow:
      'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
  },
};

// Color mappings from reactstrap to neumorphic
const COLOR_VARIANTS = {
  primary: {
    background: 'linear-gradient(145deg, var(--neu-primary, #2064d8), #1a4fa8)',
    color: '#ffffff',
  },
  secondary: {
    background: 'var(--neu-bg, #e8eef5)',
    color: 'var(--neu-text-primary, #1e3a5f)',
  },
  success: {
    background: 'linear-gradient(145deg, var(--neu-secondary, #21d8aa), #00a67d)',
    color: '#ffffff',
  },
  danger: {
    background: 'linear-gradient(145deg, var(--neu-danger, #ff4d6a), #e63950)',
    color: '#ffffff',
  },
  warning: {
    background: 'linear-gradient(145deg, var(--neu-warning, #f59e0b), #d97706)',
    color: 'var(--neu-text-primary, #1e3a5f)',
  },
  info: {
    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
    color: '#ffffff',
  },
  link: {
    background: 'transparent',
    color: 'var(--neu-primary, #2064d8)',
    boxShadow: 'none',
  },
};

// Size mappings
const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-xl',
  lg: 'px-6 py-3 text-lg rounded-xl',
};

const NeuButton = React.forwardRef(
  (
    {
      children,
      className,
      color = 'secondary',
      size = 'md',
      outline = false,
      block = false,
      disabled = false,
      active = false,
      onClick,
      type = 'button',
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    const colorStyle = COLOR_VARIANTS[color] || COLOR_VARIANTS.secondary;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

    const buttonStyle = {
      ...NEU_STYLES.base,
      ...(outline
        ? {
            background: 'var(--neu-bg, #e8eef5)',
            border: `2px solid ${color === 'primary' ? 'var(--neu-primary, #2064d8)' : colorStyle.background}`,
            color: color === 'primary' ? 'var(--neu-primary, #2064d8)' : colorStyle.color,
          }
        : colorStyle),
      ...(isHovered && !disabled && color !== 'link' ? NEU_STYLES.hover : {}),
      ...(isPressed || active ? NEU_STYLES.active : {}),
      ...(disabled ? { opacity: 0.6, cursor: 'not-allowed' } : { cursor: 'pointer' }),
      ...(block ? { width: '100%', display: 'block' } : {}),
      ...style,
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'font-medium inline-flex items-center justify-center gap-2',
          sizeClass,
          className
        )}
        style={buttonStyle}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeuButton.displayName = 'NeuButton';

export { NeuButton };
