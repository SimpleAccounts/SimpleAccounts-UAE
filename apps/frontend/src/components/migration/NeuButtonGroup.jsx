/**
 * NeuButtonGroup - Button Group with Neumorphic Styling
 */
import React from 'react';
import { cn } from '@/lib/utils';

const NEU_STYLES = {
  group: {
    display: 'inline-flex',
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
    borderRadius: '12px',
    padding: '4px',
    gap: '4px',
  },
};

const NeuButtonGroup = React.forwardRef(
  ({ children, className, vertical = false, size, style, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      className={cn(vertical && 'flex-col', className)}
      style={{
        ...NEU_STYLES.group,
        flexDirection: vertical ? 'column' : 'row',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
);
NeuButtonGroup.displayName = 'NeuButtonGroup';

export { NeuButtonGroup };
