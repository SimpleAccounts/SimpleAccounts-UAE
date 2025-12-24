/**
 * NeuAlert - Alert with Neumorphic Styling
 * Migration wrapper for reactstrap Alert
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const colorMap = {
  primary: {
    background: 'rgba(30, 110, 255, 0.1)',
    borderColor: 'var(--neu-primary, #2064d8)',
    color: 'var(--neu-primary, #2064d8)',
    Icon: Info,
  },
  secondary: {
    background: 'rgba(152, 175, 194, 0.1)',
    borderColor: 'var(--neu-text-muted, #98afc2)',
    color: 'var(--neu-text-secondary, #3d5a80)',
    Icon: Info,
  },
  success: {
    background: 'rgba(0, 200, 150, 0.1)',
    borderColor: 'var(--neu-secondary, #21d8aa)',
    color: 'var(--neu-secondary, #21d8aa)',
    Icon: CheckCircle,
  },
  danger: {
    background: 'rgba(255, 77, 106, 0.1)',
    borderColor: 'var(--neu-danger, #ff4d6a)',
    color: 'var(--neu-danger, #ff4d6a)',
    Icon: AlertCircle,
  },
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'var(--neu-warning, #f59e0b)',
    color: 'var(--neu-warning, #f59e0b)',
    Icon: AlertTriangle,
  },
  info: {
    background: 'rgba(23, 162, 184, 0.1)',
    borderColor: '#17a2b8',
    color: '#17a2b8',
    Icon: Info,
  },
  light: {
    background: 'rgba(248, 249, 250, 0.5)',
    borderColor: '#dee2e6',
    color: 'var(--neu-text-primary, #1e3a5f)',
    Icon: Info,
  },
  dark: {
    background: 'rgba(30, 58, 95, 0.1)',
    borderColor: 'var(--neu-text-primary, #1e3a5f)',
    color: 'var(--neu-text-primary, #1e3a5f)',
    Icon: Info,
  },
};

const NeuAlert = React.forwardRef(
  (
    {
      children,
      className,
      color = 'primary',
      isOpen = true,
      toggle,
      fade: _fade = true,
      style,
      ...props
    },
    ref
  ) => {
    if (!isOpen) return null;

    const { background, borderColor, color: textColor, Icon } = colorMap[color] || colorMap.primary;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-200',
          className
        )}
        style={{
          background,
          borderLeft: `4px solid ${borderColor}`,
          color: textColor,
          boxShadow:
            '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
          ...style,
        }}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">{children}</div>
        {toggle && (
          <button
            type="button"
            className="flex-shrink-0 p-1 rounded-lg transition-all duration-200 hover:opacity-70"
            onClick={toggle}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
NeuAlert.displayName = 'NeuAlert';

export { NeuAlert };
